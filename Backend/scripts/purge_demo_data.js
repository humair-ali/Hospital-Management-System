const { pool } = require('../config/db');
require('dotenv').config();

async function purgeData() {
    console.log('🚀 Starting Zero-Tolerance Data Purge...');
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        
        const [admins] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@hospital.com']);
        if (admins.length === 0) {
            throw new Error('Crucial: admin@hospital.com not found. Purge aborted to prevent lockout.');
        }
        const adminId = admins[0].id;
        console.log(`✅ Identified primary admin (ID: ${adminId})`);

        
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        
        const tablesToClear = [
            'appointments',
            'bills',
            'payments',
            'medical_records',
            'audit_logs',
            'prescriptions',
            'lab_results'
        ];

        for (const table of tablesToClear) {
            const [check] = await connection.query(`SHOW TABLES LIKE ?`, [table]);
            if (check.length > 0) {
                await connection.query(`TRUNCATE TABLE ${table}`);
                console.log(`🧹 Truncated table: ${table}`);
            }
        }

        
        await connection.query('DELETE FROM doctors');
        await connection.query('DELETE FROM patients');
        console.log('🧹 Cleared doctors and patients profiles');

        
        const [result] = await connection.query('DELETE FROM users WHERE id != ?', [adminId]);
        console.log(`👤 Removed ${result.affectedRows} dummy accounts`);

        
        for (const table of [...tablesToClear, 'users', 'doctors', 'patients']) {
            try {
                await connection.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
            } catch (e) {  }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.commit();

        console.log('\n✨ PURGE COMPLETE: System is now 100% clean.');
        console.log('📊 Current Status:');
        console.log('   - Users: 1 (Admin)');
        console.log('   - Patients: 0');
        console.log('   - Doctors: 0');
        console.log('   - Appointments: 0');
        console.log('   - Revenue: 0');

        process.exit(0);
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('❌ PURGE FAILED:', err.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

purgeData();
