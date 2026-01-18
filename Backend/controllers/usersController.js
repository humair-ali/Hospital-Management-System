const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

async function listUsers(req, res) {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '';
    const params = [];
    if (search) {
      where = 'WHERE u.name LIKE ? OR u.email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.profile_image, u.gender, u.dob, u.employee_id, u.department, 
               r.name as role, u.created_at, u.last_login 
        FROM users u JOIN roles r ON u.role_id = r.id ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function getUser(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT u.*, r.name as role, u.role_id FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    const user = rows[0];
    delete user.password;
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('getUser error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function createUser(req, res) {
  let connection;
  try {
    let { name, email, password, phone, role_id, role, specialty } = req.body;
    if (!name || !email || !password || (!role_id && !role)) {
      return res.status(400).json({ success: false, error: 'Mandatory identity vectors missing' });
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();
    if (!role_id && role) {
      const [roleRows] = await connection.query('SELECT id FROM roles WHERE name = ?', [role]);
      if (roleRows.length > 0) {
        role_id = roleRows[0].id;
      } else {
        await connection.rollback();
        return res.status(400).json({ success: false, error: `Invalid institutional role: ${role}` });
      }
    }

    
    if (role === 'admin' || parseInt(role_id) === 1) {
      if (connection) await connection.rollback();
      return res.status(403).json({ success: false, error: 'Unauthorized: Creation of additional system administrators is prohibited.' });
    }
    const [exists] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Credential conflict: Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await connection.query(
      `INSERT INTO users (role_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)`,
      [role_id, name, email, hashed, phone || null]
    );
    const userId = result.insertId;
    const [actualRole] = await connection.query('SELECT name FROM roles WHERE id = ?', [role_id]);
    const roleName = actualRole[0]?.name;
    if (roleName === 'doctor') {
      await connection.query(
        'INSERT INTO doctors (user_id, specialty) VALUES (?, ?)',
        [userId, specialty || 'General Medicine']
      );
    } else if (roleName === 'patient') {
      const mrn = `MRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await connection.query(
        'INSERT INTO patients (user_id, name, phone, medical_record_number) VALUES (?, ?, ?, ?)',
        [userId, name, phone || null, mrn]
      );
    }
    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Personnel successfully integrated into system',
      user: { id: userId, name, email, role: roleName }
    });
  } catch (err) {
    if (connection) await connection.rollback().catch(() => { });
    console.error('createUser error', err);
    res.status(500).json({ success: false, error: 'Personnel provisioning failure (Database Error)' });
  } finally {
    if (connection) connection.release();
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, phone, role_id, gender, dob, profile_image, language, theme, notifications_enabled, employee_id, department } = req.body;
    const updates = [];
    const params = [];
    const addUpdate = (field, value) => {
      if (value !== undefined) {
        updates.push(`${field} = ?`);
        params.push(value === '' ? null : value);
      }
    };
    addUpdate('name', name);
    addUpdate('email', email);
    addUpdate('phone', phone);
    addUpdate('role_id', role_id);
    addUpdate('gender', gender);
    addUpdate('dob', dob);
    addUpdate('profile_image', profile_image);
    addUpdate('language', language);
    addUpdate('theme', theme);
    addUpdate('notifications_enabled', notifications_enabled);
    addUpdate('employee_id', employee_id);
    addUpdate('department', department);
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashed);
    }
    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });
    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error('updateUser error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function updateProfile(req, res) {
  let connection;
  try {
    const id = req.user.id;
    const { name, phone, gender, dob, profile_image, language, theme, notifications_enabled, password, old_password } = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [users] = await connection.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = users[0];
    if (password) {
      if (!old_password) {
        await connection.rollback();
        return res.status(400).json({ success: false, error: 'Current password required' });
      }
      const match = await bcrypt.compare(old_password, user.password);
      if (!match) {
        await connection.rollback();
        return res.status(401).json({ success: false, error: 'Current password incorrect' });
      }
    }
    const updates = [];
    const params = [];
    const addUpdate = (field, value) => {
      if (value !== undefined) {
        updates.push(`${field} = ?`);
        params.push(value === '' ? null : value);
      }
    };
    addUpdate('name', name);
    addUpdate('phone', phone);
    addUpdate('gender', gender);
    addUpdate('dob', dob);
    addUpdate('profile_image', profile_image);
    addUpdate('language', language);
    addUpdate('theme', theme);
    addUpdate('notifications_enabled', notifications_enabled);
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashed);
    }
    if (updates.length > 0) {
      params.push(id);
      await connection.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    await connection.commit();
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    if (connection) await connection.rollback().catch(() => { });
    console.error('updateProfile error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, updateProfile };