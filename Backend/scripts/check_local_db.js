const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', '..', 'Database', 'hms_hospital.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to SQLite.');
});

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) return console.error(err.message);
    console.log('Tables:', tables);

    if (tables.find(t => t.name === 'users')) {
        db.all("SELECT id, name, email, role FROM users LIMIT 5", (err, users) => {
            if (err) return console.error(err.message);
            console.log('Users:', users);
            db.close();
        });
    } else {
        console.log('No users table found.');
        db.close();
    }
});
