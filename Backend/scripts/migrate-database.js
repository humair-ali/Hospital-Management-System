
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    let connection;
    try {
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306', 10),
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL database');
        console.log(`   Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}\n`);

        
        const sqlPath = path.join(__dirname, '..', '..', 'Database', 'database.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('📂 Executing database schema migration...\n');

        
        const [result] = await connection.query(sqlContent);

        console.log('✅ Database schema executed successfully\n');

        
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`📊 Database tables (${tables.length} total):`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   ✓ ${tableName}`);
        });

        
        const [roles] = await connection.query('SELECT COUNT(*) as count FROM roles');
        console.log(`\n👥 Roles seeded: ${roles[0].count} roles`);

        await connection.end();
        console.log('\n✅ Migration completed successfully!\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration Error:', err.message);
        console.error('SQL State:', err.sqlState);
        console.error('Error Code:', err.code);
        if (connection) await connection.end();
        process.exit(1);
    }
}

runMigration();

