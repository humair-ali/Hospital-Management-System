const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const doctors = [];
async function seedDoctors() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hms_db',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    });
    try {
        console.log('🌱 Seeding Doctors...');
        const [[doctorRole]] = await connection.query('SELECT id FROM roles WHERE name = ?', ['doctor']);
        if (!doctorRole) throw new Error('Doctor role not found! Run npm run seed first.');
        for (const doc of doctors) {
            const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [doc.email]);
            let userId;
            if (existingUser.length === 0) {
                const hashed = await bcrypt.hash(doc.password, 10);
                const [userResult] = await connection.query(
                    'INSERT INTO users (role_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
                    [doctorRole.id, doc.name, doc.email, hashed, doc.phone]
                );
                userId = userResult.insertId;
                console.log(`✅ Created User: ${doc.name}`);
            } else {
                userId = existingUser[0].id;
            }
            const [existingProfile] = await connection.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
            let doctorId;
            if (existingProfile.length === 0) {
                const [docResult] = await connection.query(
                    'INSERT INTO doctors (user_id, specialty, qualifications, bio) VALUES (?, ?, ?, ?)',
                    [userId, doc.specialty, doc.qualifications, doc.bio]
                );
                doctorId = docResult.insertId;
                console.log(`   └─ Created Doctor Profile for ${doc.name}`);
            } else {
                doctorId = existingProfile[0].id;
            }
            const [existingSlots] = await connection.query('SELECT id FROM doctor_availability WHERE doctor_id = ?', [doctorId]);
            if (existingSlots.length === 0) {
                const slots = [
                    [1, '09:00:00', '13:00:00'],
                    [1, '14:00:00', '17:00:00'],
                    [2, '09:00:00', '13:00:00'],
                    [3, '09:00:00', '13:00:00'],
                    [4, '09:00:00', '13:00:00'],
                    [5, '09:00:00', '13:00:00']
                ];
                for (const slot of slots) {
                    await connection.query(
                        'INSERT INTO doctor_availability (doctor_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)',
                        [doctorId, ...slot]
                    );
                }
                console.log(`   └─ Added availability slots.`);
            }
        }
        console.log('✨ Doctor seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding doctors:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}
seedDoctors();