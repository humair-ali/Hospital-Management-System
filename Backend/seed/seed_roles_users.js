const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const roles = [
  { name: 'admin', description: 'System administrator' },
  { name: 'doctor', description: 'Medical doctor' },
  { name: 'nurse', description: 'Nurse' },
  { name: 'receptionist', description: 'Handles registration and appointments' },
  { name: 'accountant', description: 'Billing and payments' },
  { name: 'patient', description: 'Patient account' }
];

const adminUser = {
  name: 'Admin',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@hospital.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
  phone: process.env.SEED_ADMIN_PHONE || null,
  role: 'admin'
};

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true,
  });

  try {
    console.log('Seeding roles...');
    for (const r of roles) {
      const [rows] = await connection.query('SELECT id FROM roles WHERE name = ?', [r.name]);
      if (rows.length === 0) {
        await connection.query('INSERT INTO roles (name, description) VALUES (?, ?)', [r.name, r.description]);
        console.log('- inserted role', r.name);
      } else {
        console.log('- role exists', r.name);
      }
    }

    console.log('Ensuring admin user...');
    const [[adminRole]] = await connection.query('SELECT id FROM roles WHERE name = ?', ['admin']);
    if (!adminRole) throw new Error('Admin role not found');

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [adminUser.email]);
    if (existing.length === 0) {
      const hashed = await bcrypt.hash(adminUser.password, 10);
      const [res] = await connection.query(
        'INSERT INTO users (role_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
        [adminRole.id, adminUser.name, adminUser.email, hashed, adminUser.phone]
      );
      console.log('Inserted admin user id=', res.insertId);
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message || err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();