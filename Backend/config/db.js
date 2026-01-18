const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbType = process.env.DB_TYPE || 'mysql';
let pool;

if (dbType === 'sqlite') {
    const dbPath = path.join(__dirname, '..', '..', 'Database', 'hms_hospital.db');
    const sqliteDb = new sqlite3.Database(dbPath);

    // Polyfill for mysql2 interface
    pool = {
        query: (sql, params) => {
            return new Promise((resolve, reject) => {
                // Convert MySQL LIMIT ?, ? to SQLite compat if needed? (Usually same)
                sqliteDb.all(sql, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve([rows]); // mysql2 returns [rows, fields]
                });
            });
        },
        execute: (sql, params) => {
            return new Promise((resolve, reject) => {
                sqliteDb.run(sql, params, function (err) {
                    if (err) return reject(err);
                    resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
                });
            });
        },
        getConnection: () => {
            return {
                query: (sql, params) => pool.query(sql, params),
                beginTransaction: () => new Promise((resolve) => {
                    sqliteDb.run('BEGIN TRANSACTION', resolve);
                }),
                commit: () => new Promise((resolve) => {
                    sqliteDb.run('COMMIT', resolve);
                }),
                rollback: () => new Promise((resolve) => {
                    sqliteDb.run('ROLLBACK', resolve);
                }),
                release: () => { }
            };
        },
        end: () => {
            return new Promise((resolve) => sqliteDb.close(() => resolve()));
        }
    };
    console.log('📦 Using Local SQLite Database');
} else {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        waitForConnections: true,
        connectionLimit: 10,
        enableKeepAlive: true,
    });
}

const testConnection = async () => {
    try {
        if (dbType === 'sqlite') return true;
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        return false;
    }
};

module.exports = { pool, testConnection };