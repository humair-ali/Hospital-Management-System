const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedUXData() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const hashedPass = await bcrypt.hash('password123', 10);

        
        const [roles] = await connection.query('SELECT id, name FROM roles');
        const rolesMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

        const usersToCreate = [
            { name: 'Dr. Sarah Connor', email: 'sarah.doctor@hospital.com', role: 'doctor', phone: '555-0101', specialty: 'Cardiology' },
            { name: 'Nurse Joy', email: 'joy.nurse@hospital.com', role: 'nurse', phone: '555-0102' },
            { name: 'John Accountant', email: 'john.finance@hospital.com', role: 'accountant', phone: '555-0103' },
            { name: 'Alice Receptionist', email: 'alice.staff@hospital.com', role: 'receptionist', phone: '555-0104' },
            { name: 'Robert Patient', email: 'robert.pat@gmail.com', role: 'patient', phone: '555-0999' }
        ];

        for (const u of usersToCreate) {
            
            const [exists] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
            if (exists.length > 0) continue;

            const [res] = await connection.query(
                'INSERT INTO users (role_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
                [rolesMap[u.role], u.name, u.email, hashedPass, u.phone]
            );
            const userId = res.insertId;

            if (u.role === 'doctor') {
                await connection.query(
                    'INSERT INTO doctors (user_id, specialty, qualifications, bio) VALUES (?, ?, ?, ?)',
                    [userId, u.specialty, 'MD, FACC', 'Senior Cardiologist with 15 years experience.']
                );
            } else if (u.role === 'patient') {
                const mrn = `MRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                await connection.query(
                    'INSERT INTO patients (user_id, name, phone, medical_record_number) VALUES (?, ?, ?, ?)',
                    [userId, u.name, u.phone, mrn]
                );
            }
        }

        await connection.commit();
        console.log('UX Data seeded successfully!');
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Seeding error:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

seedUXData();
