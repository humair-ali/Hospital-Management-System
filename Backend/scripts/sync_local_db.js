const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', '..', 'Database', 'hms_hospital.db');
const db = new sqlite3.Database(dbPath);

async function sync() {
    const hash = await bcrypt.hash('admin123', 10);

    db.run("UPDATE users SET email = ?, password = ? WHERE id = 1",
        ['admin@hospital.com', hash],
        function (err) {
            if (err) return console.error(err.message);
            console.log('Local SQLite Admin credentials updated.');
            db.close();
        }
    );
}

sync();
