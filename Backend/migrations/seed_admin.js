
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = 'admin@hms.local'");
        if (rows.length === 0) {
            console.log('🌱 Seeding admin user...');
            const hash = await bcrypt.hash('admin123', 10);
            await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
                ['System Admin', 'admin@hms.local', hash, 'admin']);
            console.log('✅ Admin user created successfully.');
        } else {
            console.log('ℹ️  Admin user already exists.');
        }
        process.exit(0);
    } catch (e) {
        console.error('❌ Seeding failed:', e.message);
        process.exit(1);
    }
})();
