const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const usersToCreate = [
    { role: 'doctor', email: 'doctor@hospital.com', name: 'Dr. John Audit', phone: '1111111111' },
    { role: 'nurse', email: 'nurse@hospital.com', name: 'Nurse Jane Audit', phone: '2222222222' },
    { role: 'receptionist', email: 'receptionist@hospital.com', name: 'Recep Audit', phone: '3333333333' },
    { role: 'accountant', email: 'accountant@hospital.com', name: 'Accountant Audit', phone: '4444444444' },
    { role: 'patient', email: 'patient@hospital.com', name: 'Patient Audit', phone: '5555555555' }
];
const password = 'password123';
async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hms_db',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    });
    try {
        console.log('Seeding audit users...');
        const hashedPassword = await bcrypt.hash(password, 10);
        for (const u of usersToCreate) {
            const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', [u.role]);
            if (roles.length === 0) {
                console.error(`Role ${u.role} not found, skipping.`);
                continue;
            }
            const roleId = roles[0].id;
            const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
            let userId;
            if (existing.length === 0) {
                const [res] = await connection.query(
                    'INSERT INTO users (role_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
                    [roleId, u.name, u.email, hashedPassword, u.phone]
                );
                userId = res.insertId;
                console.log(`Created user ${u.email} (ID: ${userId})`);
            } else {
                userId = existing[0].id;
                console.log(`User ${u.email} exists (ID: ${userId})`);
                await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
            }
            if (u.role === 'doctor') {
                const [docRows] = await connection.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
                if (docRows.length === 0) {
                    await connection.query(
                        'INSERT INTO doctors (user_id, specialty, qualifications, bio) VALUES (?, ?, ?, ?)',
                        [userId, 'General Practice', 'MBBS', 'Audit Doctor Bio']
                    );
                    console.log(`Created doctor profile for userId ${userId}`);
                }
            } else if (u.role === 'patient') {
                const [patRows] = await connection.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
                if (patRows.length === 0) {
                    const mrn = 'MRN-' + Math.floor(Math.random() * 10000);
                    try {
                        await connection.query(
                            'INSERT INTO patients (user_id, medical_record_number, name, dob, gender, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [userId, mrn, u.name, '1990-01-01', 'Male', u.phone, '123 Audit St']
                        );
                        console.log(`Created patient profile for userId ${userId} with MRN ${mrn}`);
                    } catch (e) {
                        console.log('Error creating patient profile, possibly MRN dup', e.message);
                    }
                }
            }
        }
        console.log('Audit users seeded successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}
seed();