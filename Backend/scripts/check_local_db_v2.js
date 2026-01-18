const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', '..', 'Database', 'hms_hospital.db');

const db = new sqlite3.Database(dbPath);

db.all("SELECT id, name, email, role_id FROM users", (err, users) => {
    if (err) return console.error(err.message);
    console.log('Local SQLite Users:', users);
    db.close();
});
