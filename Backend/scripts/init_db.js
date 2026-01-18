const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');

const dbPath = 'C:\\Users\\Mr Naveed\\Desktop\\hms-hospital\\Database\\hms_hospital.db';

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('❌ Deleted old database');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }
  console.log('✅ Created new SQLite database');
  initDB();
});

async function initDB() {
  const sql = fs.readFileSync('migrations/schema_sqlite.sql', 'utf8');
  
  db.exec(sql, async (err) => {
    if (err) {
      console.error('❌ Schema error:', err);
      process.exit(1);
    }
    console.log('✅ Schema created');
    
    
    const adminPass = await bcrypt.hash('admin123', 10);
    const doctorPass = await bcrypt.hash('doctor123', 10);
    const nursePass = await bcrypt.hash('nurse123', 10);
    const receptionistPass = await bcrypt.hash('receptionist123', 10);
    const accountantPass = await bcrypt.hash('accountant123', 10);
    const patientPass = await bcrypt.hash('patient123', 10);

    const queries = [
      ['INSERT INTO roles (name, description) VALUES (?, ?)', ['admin', 'System administrator']],
      ['INSERT INTO roles (name, description) VALUES (?, ?)', ['doctor', 'Medical specialist']],
      ['INSERT INTO roles (name, description) VALUES (?, ?)', ['nurse', 'Nursing personnel']],
      ['INSERT INTO roles (name, description) VALUES (?, ?)', ['receptionist', 'Guest relations']],
      ['INSERT INTO roles (name, description) VALUES (?, ?)', ['accountant', 'Financial comptroller']],
      ['INSERT INTO roles (name, description) VALUES (?, ?)', ['patient', 'Patient profile']],
    ];

    let executed = 0;
    const userIds = {};

    queries.forEach((q) => {
      db.run(q[0], q[1], function(err) {
        if (err) console.error('Error:', err);
        executed++;
        if (executed === queries.length) {
          console.log('✅ Roles created');
          insertUsers(adminPass, doctorPass, nursePass, receptionistPass, accountantPass, patientPass);
        }
      });
    });

    function insertUsers(a, d, n, r, ac, p) {
      const users = [
        [1, 'Admin User', 'admin@hms.local', a, '+1234567890', 'Male', '1980-01-15'],
        [2, 'Dr. Ahmed Hassan', 'dr.ahmed@hms.local', d, '+1234567891', 'Male', '1982-05-20'],
        [2, 'Dr. Fatima Khan', 'dr.fatima@hms.local', d, '+1234567892', 'Female', '1985-03-10'],
        [3, 'Sarah Nurse', 'sarah@hms.local', n, '+1234567893', 'Female', '1988-07-25'],
        [4, 'John Receptionist', 'john@hms.local', r, '+1234567894', 'Male', '1990-09-12'],
        [5, 'Mike Accountant', 'mike@hms.local', ac, '+1234567895', 'Male', '1987-11-18'],
        [6, 'Ali Patient', 'ali@hms.local', p, '+1234567896', 'Male', '1995-02-14'],
        [6, 'Zainab Patient', 'zainab@hms.local', p, '+1234567897', 'Female', '1998-06-21'],
      ];

      let count = 0;
      users.forEach(([rid, name, email, pass, phone, gender, dob]) => {
        db.run(
          'INSERT INTO users (role_id, name, email, password, phone, gender, dob) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [rid, name, email, pass, phone, gender, dob],
          function(err) {
            if (err) console.error('User insert error:', err);
            userIds[email] = this.lastID;
            count++;
            if (count === users.length) {
              console.log('✅ Users created');
              insertDoctors(userIds);
            }
          }
        );
      });
    }

    function insertDoctors(userIds) {
      const doctors = [
        [userIds['dr.ahmed@hms.local'], 'Cardiology', 'MD, Board Certified', 'Heart specialist'],
        [userIds['dr.fatima@hms.local'], 'Pediatrics', 'MD, MS Pediatrics', 'Child care specialist'],
      ];

      const docIds = {};
      let count = 0;

      doctors.forEach((d, idx) => {
        db.run(
          'INSERT INTO doctors (user_id, specialty, qualifications, bio) VALUES (?, ?, ?, ?)',
          d,
          function(err) {
            if (err) console.error('Doctor insert error:', err);
            docIds[d[0]] = this.lastID;
            count++;
            if (count === doctors.length) {
              console.log('✅ Doctors created');
              insertPatients(userIds, docIds);
            }
          }
        );
      });
    }

    function insertPatients(userIds, docIds) {
      const patients = [
        [userIds['ali@hms.local'], 'Ali Patient', '+1234567896', '1995-02-14', 'Male', '123 Main', 'Parent', '+11111', 'MRN001'],
        [userIds['zainab@hms.local'], 'Zainab', '+1234567897', '1998-06-21', 'Female', '456 Oak', 'Parent', '+11111', 'MRN002'],
        [null, 'Hassan Khan', '+1234567898', '1992-03-15', 'Male', '789 Elm', 'Parent', '+11111', 'MRN003'],
        [null, 'Amina Ali', '+1234567899', '1993-04-20', 'Female', '321 Pine', 'Parent', '+11111', 'MRN004'],
      ];

      let count = 0;
      const patientIds = {};
      patients.forEach((p, idx) => {
        db.run(
          'INSERT INTO patients (user_id, name, phone, dob, gender, address, emergency_contact_name, emergency_contact_phone, medical_record_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          p,
          function(err) {
            if (err) console.error('Patient insert error:', err);
            patientIds[`p${idx}`] = this.lastID;
            count++;
            if (count === patients.length) {
              console.log('✅ Patients created');
              insertAppointments(patientIds, docIds, userIds);
            }
          }
        );
      });
    }

    function insertAppointments(patientIds, docIds, userIds) {
      const appts = [
        [patientIds['p0'], Object.values(docIds)[0], userIds['john@hms.local'], '2026-01-20 10:00:00', 30, 'confirmed', 'Check-up', 'Notes'],
        [patientIds['p1'], Object.values(docIds)[1], userIds['john@hms.local'], '2026-01-21 11:00:00', 30, 'completed', 'Follow-up', 'Notes'],
      ];

      let count = 0;
      appts.forEach(a => {
        db.run(
          'INSERT INTO appointments (patient_id, doctor_id, receptionist_id, scheduled_at, duration_minutes, status, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          a,
          (err) => {
            if (err) console.error('Appt error:', err);
            count++;
            if (count === appts.length) {
              console.log('✅ Appointments created');
              insertBills(patientIds, userIds);
            }
          }
        );
      });
    }

    function insertBills(patientIds, userIds) {
      const bills = [
        [patientIds['p0'], userIds['mike@hms.local'], 500, 500, 'paid', '2026-01-17 10:00:00', '2026-02-17 10:00:00', 'Invoice'],
        [patientIds['p1'], userIds['mike@hms.local'], 700, 700, 'issued', '2026-01-16 10:00:00', '2026-02-16 10:00:00', 'Invoice'],
      ];

      let count = 0;
      bills.forEach(b => {
        db.run(
          'INSERT INTO bills (patient_id, created_by, total_amount, total_paid, status, issued_at, due_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          b,
          (err) => {
            if (err) console.error('Bill error:', err);
            count++;
            if (count === bills.length) {
              console.log('\n✨ Database initialized!');
              console.log('\n📋 Credentials:');
              console.log('Admin: admin@hms.local / admin123');
              console.log('Doctor: dr.ahmed@hms.local / doctor123');
              console.log('Patient: ali@hms.local / patient123');
              db.close();
              process.exit(0);
            }
          }
        );
      });
    }
  });
}
