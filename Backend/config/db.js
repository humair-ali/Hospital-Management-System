const mysql = require('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, 
    idleTimeout: 60000, 
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: true
    } : {
        
        rejectUnauthorized: false
    }
});


const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ MySQL Connection Error:', err.message);
        console.error('   Please check your .env database configuration');
        return false;
    }
};


process.on('SIGTERM', async () => {
    console.log('Closing MySQL connection pool...');
    await pool.end();
});

module.exports = { pool, testConnection };