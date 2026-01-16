const sqlite3 = require('sqlite3').verbose(); const path = require('path'); const dbPath = path.resolve(__dirname, '../../Database/hms_hospital.db'); console.log(`📦 Using SQLite Database: ${dbPath}`); const db = new sqlite3.Database(dbPath, (err) => { if (err) console.error('❌ SQLite Connection Error:', err.message); else { console.log('✅ Connected to SQLite Database'); db.run('PRAGMA foreign_keys = ON'); } }); const promiseQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err); else resolve([rows, []]);
            });
        } else { db.run(sql, params, function (err) { if (err) reject(err); else resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]); }); }
    });
}; const fakeConnection = { release: () => { }, query: promiseQuery, execute: promiseQuery, beginTransaction: () => Promise.resolve(), commit: () => Promise.resolve(), rollback: () => Promise.resolve() }; const pool = { query: promiseQuery, execute: promiseQuery, getConnection: async () => fakeConnection }; module.exports = {
    pool: pool,
    query: promiseQuery, testConnection: async () => { return new Promise((resolve) => { db.get("SELECT 1", (err) => resolve(!err)); }); }, getConnection: () => fakeConnection
};