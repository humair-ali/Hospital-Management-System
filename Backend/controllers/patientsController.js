const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { insertAuditLog } = require('../config/audit');
async function getPatients(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT DISTINCT p.* FROM patients p';
    let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM patients p';
    let whereClause = ' WHERE 1=1';
    const params = [];
    const userRole = req.user.role;
    const userId = req.user.id;
    if (userRole === 'doctor') {
      const [dResult] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
      if (dResult.length === 0) {
        return res.json({ success: true, data: [], pagination: { total: 0, page, limit, pages: 0 } });
      }
      const myDoctorId = dResult[0].id;
      query += ' JOIN appointments a ON p.id = a.patient_id';
      countQuery += ' JOIN appointments a ON p.id = a.patient_id';
      whereClause += ' AND a.doctor_id = ?';
      params.push(myDoctorId);
    } else if (userRole === 'nurse') {
      query += ' JOIN appointments a ON p.id = a.patient_id';
      countQuery += ' JOIN appointments a ON p.id = a.patient_id';
      whereClause += ' AND (a.status = "confirmed" OR a.status = "checked_in")';
    }
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.medical_record_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += `${whereClause} LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    countQuery += whereClause;
    const [patients] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params);
    res.json({
      success: true,
      data: patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
async function getPatient(req, res) {
  try {
    const { id } = req.params;
    const { role: userRole, patient_id: myPatientId, id: userId } = req.user;
    if (userRole === 'patient') {
      if (parseInt(id) !== myPatientId) {
        return res.status(403).json({ success: false, error: 'Access denied: You can only view your own profile' });
      }
    }
    const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);
    if (patients.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: patients[0] });
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
async function createPatient(req, res) {
  let connection;
  try {
    const { medical_record_number, name, dob, gender, phone, address, emergency_contact_name, emergency_contact_phone, email } = req.body;
    const mrn = medical_record_number || `MRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const userEmail = email || `${mrn.toLowerCase()}@hospital.com`;
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const [roles] = await connection.query('SELECT id FROM roles WHERE name = "patient"');
    const roleId = roles.length > 0 ? roles[0].id : null;
    let userId = null;
    if (roleId) {
      const [userResult] = await connection.query(
        'INSERT INTO users (role_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
        [roleId, name, userEmail, hashedPassword, phone || null]
      );
      userId = userResult.insertId;
    }
    const [result] = await connection.query(
      `INSERT INTO patients (user_id, medical_record_number, name, dob, gender, phone, address, emergency_contact_name, emergency_contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, mrn, name, dob || null, gender || null, phone || null, address || null, emergency_contact_name || null, emergency_contact_phone || null]
    );
    const newPatientId = result.insertId;
    await connection.commit();
    await insertAuditLog(req, 'CREATE_PATIENT', 'patients', newPatientId, null, { medical_record_number: mrn, name });
    res.status(201).json({
      success: true,
      message: 'Patient created successfully with login account',
      login_credentials: {
        email: userEmail,
        password: defaultPassword
      },
      data: {
        id: newPatientId,
        user_id: userId,
        medical_record_number: mrn,
        name,
        dob,
        gender,
        phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        email: userEmail
      }
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error creating patient:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'Patient with this MRN or Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
}
async function updatePatient(req, res) {
  let connection;
  try {
    const { id } = req.params;
    const { role: userRole, patient_id: myPatientId } = req.user;
    const updates = req.body;
    if (userRole === 'patient' && parseInt(id) !== myPatientId) {
      return res.status(403).json({ success: false, error: 'Access denied: You can only update your own profile' });
    }
    const fields = Object.keys(updates).filter(k =>
      ['name', 'dob', 'gender', 'phone', 'address', 'emergency_contact_name', 'emergency_contact_phone'].includes(k)
    );
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [before] = await connection.query('SELECT * FROM patients WHERE id = ?', [id]);
    if (before.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(id);
    await connection.query(`UPDATE patients SET ${setClause} WHERE id = ?`, values);
    if (updates.name || updates.phone) {
      const userId = before[0].user_id;
      if (userId) {
        const userUpdates = [];
        const userValues = [];
        if (updates.name) { userUpdates.push('name = ?'); userValues.push(updates.name); }
        if (updates.phone) { userUpdates.push('phone = ?'); userValues.push(updates.phone); }
        userValues.push(userId);
        await connection.query(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`, userValues);
      }
    }
    await connection.commit();
    await insertAuditLog(req, 'UPDATE_PATIENT', 'patients', id, before[0], updates);
    res.json({ success: true, message: 'Patient profile updated' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error updating patient:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
}
async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const [before] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);
    if (before.length === 0) return res.status(404).json({ success: false, error: 'Patient not found' });
    await pool.query('DELETE FROM patients WHERE id = ?', [id]);
    await insertAuditLog(req, 'DELETE_PATIENT', 'patients', id, before[0], null);
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient };