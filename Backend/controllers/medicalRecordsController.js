const { pool } = require('../config/db');

async function listRecords(req, res) {
  try {
    const { role } = req.user;
    const userId = req.user.id;
    let { patient_id = null, page = 1, limit = 50 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let rows;

    if (role === 'patient') {
      const [pResult] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      const myPatientId = pResult[0]?.id;
      [rows] = await pool.query(
        `SELECT mr.*, p.name as patient_name, u.name as doctor_name 
          FROM medical_records mr 
          JOIN patients p ON mr.patient_id = p.id 
          JOIN doctors d ON mr.doctor_id = d.id 
          JOIN users u ON d.user_id = u.id 
         WHERE mr.patient_id = ? 
         ORDER BY mr.visit_date DESC LIMIT ? OFFSET ?`,
        [myPatientId, parseInt(limit), offset]
      );
    } else if (role === 'doctor') {
      const [dResult] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
      const myDoctorId = dResult[0]?.id;
      if (!myDoctorId) {
        return res.status(403).json({ success: false, error: 'Doctor profile not found' });
      }
      
      [rows] = await pool.query(
        `SELECT mr.*, p.name as patient_name, u.name as doctor_name 
          FROM medical_records mr 
          JOIN patients p ON mr.patient_id = p.id 
          JOIN doctors d ON mr.doctor_id = d.id 
          JOIN users u ON d.user_id = u.id 
         WHERE mr.patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id = ?) 
         ORDER BY mr.visit_date DESC LIMIT ? OFFSET ?`,
        [myDoctorId, parseInt(limit), offset]
      );
    } else if (role === 'nurse') {
      [rows] = await pool.query(
        `SELECT mr.id, mr.patient_id, mr.doctor_id, mr.visit_date, 
                'HIDDEN' as diagnosis, 'HIDDEN' as treatment, 'HIDDEN' as prescriptions,
                mr.notes, mr.bp, mr.heart_rate, mr.temperature, mr.weight, mr.created_at,
                p.name as patient_name, u.name as doctor_name 
         FROM medical_records mr 
          JOIN patients p ON mr.patient_id = p.id 
          JOIN doctors d ON mr.doctor_id = d.id 
          JOIN users u ON d.user_id = u.id 
         ORDER BY mr.visit_date DESC LIMIT ? OFFSET ?`,
        [parseInt(limit), offset]
      );
    } else {
      
      [rows] = await pool.query(
        `SELECT mr.*, p.name as patient_name, u.name as doctor_name, p.dob, p.gender, p.medical_record_number 
         FROM medical_records mr 
          JOIN patients p ON mr.patient_id = p.id 
          JOIN doctors d ON mr.doctor_id = d.id 
          JOIN users u ON d.user_id = u.id 
         ORDER BY mr.visit_date DESC LIMIT ? OFFSET ?`,
        [parseInt(limit), offset]
      );
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listRecords error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function getRecord(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT mr.*, p.name as patient_name FROM medical_records mr JOIN patients p ON mr.patient_id = p.id WHERE mr.id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Record not found' });

    const record = rows[0];

    
    if (role === 'patient') {
      const [pResult] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      const myPatientId = pResult[0]?.id;
      if (record.patient_id !== myPatientId) {
        return res.status(403).json({ success: false, error: 'Access denied: You can only view your own records' });
      }
    } else if (role === 'doctor') {
      const [dResult] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
      const myDoctorId = dResult[0]?.id;
      const [assignment] = await pool.query(
        'SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1',
        [myDoctorId, record.patient_id]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ success: false, error: 'Access denied: Patient not assigned to you' });
      }
    }

    if (role === 'nurse') {
      record.diagnosis = 'HIDDEN';
      record.treatment = 'HIDDEN';
      record.prescriptions = 'HIDDEN';
    }

    res.json({ success: true, data: record });
  } catch (err) {
    console.error('getRecord error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function createRecord(req, res) {
  try {
    const {
      patient_id, doctor_id, visit_date, diagnosis, treatment,
      prescriptions, notes, department, bp, heart_rate,
      temperature, weight, intervention_strategy, attachments
    } = req.body;

    if (!patient_id || !doctor_id || !visit_date) {
      return res.status(400).json({ success: false, error: 'Missing required fields (med-create)' });
    }

    const [result] = await pool.query(
      `INSERT INTO medical_records (
        patient_id, doctor_id, visit_date, diagnosis, treatment, 
        prescriptions, notes, department, bp, heart_rate, 
        temperature, weight, intervention_strategy, attachments, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        patient_id, doctor_id, visit_date, diagnosis || null, treatment || null,
        prescriptions || null, notes || null, department || null, bp || null,
        heart_rate || null, temperature || null, weight || null,
        intervention_strategy || null, attachments ? JSON.stringify(attachments) : null
      ]
    );

    res.status(201).json({ success: true, message: 'Record created', data: { id: result.insertId } });
  } catch (err) {
    console.error('createRecord error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function updateRecord(req, res) {
  try {
    const { id } = req.params;
    const { role: userRole } = req.user;
    const userId = req.user.id;

    if (userRole === 'patient') {
      return res.status(403).json({ success: false, error: 'Access denied: Patients cannot modify clinical records' });
    }

    if (userRole === 'doctor') {
      const [dResult] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
      const myDoctorId = dResult[0]?.id;
      const [record] = await pool.query('SELECT doctor_id FROM medical_records WHERE id = ?', [id]);
      if (record.length === 0) return res.status(404).json({ success: false, error: 'Record not found' });
      if (record[0].doctor_id !== myDoctorId) {
        return res.status(403).json({ success: false, error: 'Access denied: You can only edit records you created' });
      }
    }

    let {
      diagnosis, treatment, prescriptions, notes, department,
      bp, heart_rate, temperature, weight, intervention_strategy, attachments
    } = req.body;

    
    if (userRole === 'nurse') {
      const [existingRecord] = await pool.query('SELECT diagnosis, treatment, prescriptions FROM medical_records WHERE id = ?', [id]);
      if (existingRecord.length > 0) {
        diagnosis = existingRecord[0].diagnosis;
        treatment = existingRecord[0].treatment;
        prescriptions = existingRecord[0].prescriptions;
      }
    }

    await pool.query(
      `UPDATE medical_records SET 
         diagnosis = ?, treatment = ?, prescriptions = ?, notes = ?, 
         department = ?, bp = ?, heart_rate = ?, temperature = ?, 
         weight = ?, intervention_strategy = ?, attachments = ?
        WHERE id = ?`,
      [
        diagnosis, treatment, prescriptions, notes || null,
        department || null, bp || null, heart_rate || null, temperature || null,
        weight || null, intervention_strategy || null,
        attachments ? JSON.stringify(attachments) : null, id
      ]
    );

    res.json({ success: true, message: 'Record updated' });
  } catch (err) {
    console.error('updateRecord error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function deleteRecord(req, res) {
  try {
    const { id } = req.params;
    const { role: userRole } = req.user;

    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Security alert: Unauthorized deletion attempt' });
    }

    await pool.query('DELETE FROM medical_records WHERE id = ?', [id]);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    console.error('deleteRecord error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, deleteRecord };