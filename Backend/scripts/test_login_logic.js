const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'Database', 'hms_hospital.db');
const db = new sqlite3.Database(dbPath);

const email = 'admin@hospital.com';
const password = 'admin123';

const sql = `
    SELECT u.id, u.name, u.email, u.password, u.phone, r.name as role
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.email = ?
`;

db.get(sql, [email], async (err, user) => {
    if (err) {
        console.error('SQL Error:', err.message);
        process.exit(1);
    }
    if (!user) {
        console.log('User not found');
        process.exit(0);
    }
    console.log('User found:', user.email);
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);
    db.close();
});
