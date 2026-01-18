const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = 'C:\\Users\\Mr Naveed\\Desktop\\hms-hospital\\Database\\hms_hospital.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite Database');
});

async function seedDatabase() {
  return new Promise(async (resolve, reject) => {
    try {
      
      db.run('PRAGMA foreign_keys = ON', async (err) => {
        if (err) {
          console.error('❌ Error enabling foreign keys:', err);
          reject(err);
          return;
        }

        console.log('🌱 Starting database seeding...');

        
        const adminPass = await bcrypt.hash('admin123', 10);
        const doctorPass = await bcrypt.hash('doctor123', 10);
        const nursePass = await bcrypt.hash('nurse123', 10);
        const receptionistPass = await bcrypt.hash('receptionist123', 10);
        const accountantPass = await bcrypt.hash('accountant123', 10);
        const patientPass = await bcrypt.hash('patient123', 10);

        
        console.log('🗑️  Clearing existing data...');
        db.serialize(() => {
          db.run('DELETE FROM audit_logs');
          db.run('DELETE FROM payments');
          db.run('DELETE FROM bill_items');
          db.run('DELETE FROM bills');
          db.run('DELETE FROM medical_records');
          db.run('DELETE FROM appointments');
          db.run('DELETE FROM doctor_availability');
          db.run('DELETE FROM doctors');
          db.run('DELETE FROM patients');
          db.run('DELETE FROM users');
          db.run('DELETE FROM roles');

          
          console.log('👥 Creating roles...');
          const roles = [
            { name: 'admin', description: 'System administrator' },
            { name: 'doctor', description: 'Medical specialist' },
            { name: 'nurse', description: 'Nursing personnel' },
            { name: 'receptionist', description: 'Guest relations / Front desk' },
            { name: 'accountant', description: 'Financial comptroller' },
            { name: 'patient', description: 'Authorized patient profile' }
          ];

          let roleMap = {};
          let rolesCreated = 0;

          roles.forEach(role => {
            db.run(
              'INSERT INTO roles (name, description) VALUES (?, ?)',
              [role.name, role.description],
              function(err) {
                if (err) {
                  console.error(`Error creating role ${role.name}:`, err);
                  return;
                }
                roleMap[role.name] = this.lastID;
                rolesCreated++;

                if (rolesCreated === roles.length) {
                  createUsers(roleMap, adminPass, doctorPass, nursePass, receptionistPass, accountantPass, patientPass);
                }
              }
            );
          });
        });

        function createUsers(roleMap, adminPass, doctorPass, nursePass, receptionistPass, accountantPass, patientPass) {
          console.log('✅ Roles created');
          console.log('👤 Creating users...');

          let usersCreated = 0;
          let userIds = {};

          const usersToCreate = [
            { role: 'admin', name: 'Admin User', email: 'admin@hms.local', pass: adminPass, phone: '+1234567890', gender: 'Male', dob: '1980-01-15' },
            { role: 'doctor', name: 'Dr. Ahmed Hassan', email: 'dr.ahmed@hms.local', pass: doctorPass, phone: '+1234567891', gender: 'Male', dob: '1982-05-20' },
            { role: 'doctor', name: 'Dr. Fatima Khan', email: 'dr.fatima@hms.local', pass: doctorPass, phone: '+1234567892', gender: 'Female', dob: '1985-03-10' },
            { role: 'nurse', name: 'Sarah Nurse', email: 'sarah@hms.local', pass: nursePass, phone: '+1234567893', gender: 'Female', dob: '1988-07-25' },
            { role: 'receptionist', name: 'John Receptionist', email: 'john@hms.local', pass: receptionistPass, phone: '+1234567894', gender: 'Male', dob: '1990-09-12' },
            { role: 'accountant', name: 'Mike Accountant', email: 'mike@hms.local', pass: accountantPass, phone: '+1234567895', gender: 'Male', dob: '1987-11-18' },
            { role: 'patient', name: 'Ali Patient', email: 'ali@hms.local', pass: patientPass, phone: '+1234567896', gender: 'Male', dob: '1995-02-14' },
            { role: 'patient', name: 'Zainab Patient', email: 'zainab@hms.local', pass: patientPass, phone: '+1234567897', gender: 'Female', dob: '1998-06-21' }
          ];

          usersToCreate.forEach((user, idx) => {
            db.run(
              'INSERT INTO users (role_id, name, email, password, phone, gender, dob) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [roleMap[user.role], user.name, user.email, user.pass, user.phone, user.gender, user.dob],
              function(err) {
                if (err) {
                  console.error(`Error creating user ${user.email}:`, err);
                  return;
                }
                userIds[`${user.role}_${idx}`] = this.lastID;
                usersCreated++;

                if (usersCreated === usersToCreate.length) {
                  createDoctors(userIds, roleMap);
                }
              }
            );
          });
        }

        function createDoctors(userIds, roleMap) {
          console.log('✅ Users created');
          console.log('🩺 Creating doctor profiles...');

          let doctorsCreated = 0;
          let doctorIds = {};

          const doctors = [
            { userId: userIds['doctor_1'], specialty: 'Cardiology', qualifications: 'MD, Board Certified', bio: 'Specialist in heart diseases with 15 years of experience' },
            { userId: userIds['doctor_2'], specialty: 'Pediatrics', qualifications: 'MD, MS Pediatrics', bio: 'Experienced in child healthcare and development' }
          ];

          doctors.forEach((doctor, idx) => {
            db.run(
              'INSERT INTO doctors (user_id, specialty, qualifications, bio) VALUES (?, ?, ?, ?)',
              [doctor.userId, doctor.specialty, doctor.qualifications, doctor.bio],
              function(err) {
                if (err) {
                  console.error('Error creating doctor:', err);
                  return;
                }
                doctorIds[`doctor_${idx}`] = this.lastID;
                doctorsCreated++;

                if (doctorsCreated === doctors.length) {
                  createPatients(userIds, roleMap, doctorIds);
                }
              }
            );
          });
        }

        function createPatients(userIds, roleMap, doctorIds) {
          console.log('✅ Doctor profiles created');
          console.log('🏥 Creating patient records...');

          let patientsCreated = 0;
          let patientIds = {};

          const patients = [
            { userId: userIds['patient_0'], name: 'Ali Patient', phone: '+1234567896', dob: '1995-02-14', gender: 'Male', address: '123 Main St', emName: 'Mother Ali', emPhone: '+1234567900', mrn: 'MRN001' },
            { userId: userIds['patient_1'], name: 'Zainab Patient', phone: '+1234567897', dob: '1998-06-21', gender: 'Female', address: '456 Oak Ave', emName: 'Father Zainab', emPhone: '+1234567901', mrn: 'MRN002' },
            { name: 'Hassan Khan', phone: '+1234567898', dob: '1992-03-15', gender: 'Male', address: '789 Elm St', emName: 'Guardian 1', emPhone: '+1234567902', mrn: 'MRN003' },
            { name: 'Amina Ali', phone: '+1234567899', dob: '1993-04-20', gender: 'Female', address: '321 Pine St', emName: 'Guardian 2', emPhone: '+1234567902', mrn: 'MRN004' },
            { name: 'Omar Sheikh', phone: '+1234567900', dob: '1994-05-25', gender: 'Male', address: '654 Maple St', emName: 'Guardian 3', emPhone: '+1234567902', mrn: 'MRN005' },
            { name: 'Layla Mohamed', phone: '+1234567901', dob: '1991-06-30', gender: 'Female', address: '987 Cedar St', emName: 'Guardian 4', emPhone: '+1234567902', mrn: 'MRN006' },
            { name: 'Ibrahim Hassan', phone: '+1234567902', dob: '1996-07-10', gender: 'Male', address: '147 Birch St', emName: 'Guardian 5', emPhone: '+1234567902', mrn: 'MRN007' }
          ];

          patients.forEach((patient, idx) => {
            db.run(
              'INSERT INTO patients (user_id, name, phone, dob, gender, address, emergency_contact_name, emergency_contact_phone, medical_record_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [patient.userId || null, patient.name, patient.phone, patient.dob, patient.gender, patient.address, patient.emName, patient.emPhone, patient.mrn],
              function(err) {
                if (err) {
                  console.error('Error creating patient:', err);
                  return;
                }
                patientIds[`patient_${idx}`] = this.lastID;
                patientsCreated++;

                if (patientsCreated === patients.length) {
                  createDoctorAvailability(userIds, doctorIds, patientIds);
                }
              }
            );
          });
        }

        function createDoctorAvailability(userIds, doctorIds, patientIds) {
          console.log('✅ Patient records created');
          console.log('📅 Creating doctor availability...');

          let availabilityCreated = 0;
          const days = [1, 2, 3, 4, 5]; 
          const totalAvailability = days.length * 2; 

          days.forEach(day => {
            
            db.run(
              'INSERT INTO doctor_availability (doctor_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)',
              [doctorIds['doctor_0'], day, '09:00:00', '17:00:00'],
              function(err) {
                if (err) console.error('Error creating availability:', err);
                availabilityCreated++;
                if (availabilityCreated === totalAvailability) {
                  createAppointments(userIds, doctorIds, patientIds);
                }
              }
            );

            
            db.run(
              'INSERT INTO doctor_availability (doctor_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)',
              [doctorIds['doctor_1'], day, '10:00:00', '16:00:00'],
              function(err) {
                if (err) console.error('Error creating availability:', err);
                availabilityCreated++;
                if (availabilityCreated === totalAvailability) {
                  createAppointments(userIds, doctorIds, patientIds);
                }
              }
            );
          });
        }

        function createAppointments(userIds, doctorIds, patientIds) {
          console.log('✅ Doctor availability created');
          console.log('📆 Creating appointments...');

          let appointmentsCreated = 0;
          const appointmentStatuses = ['completed', 'confirmed', 'requested'];
          const reasons = ['Chest pain', 'Check-up', 'Follow-up', 'Vaccination'];
          const totalAppointments = 8;

          for (let i = 0; i < totalAppointments; i++) {
            const appointmentDate = new Date();
            appointmentDate.setDate(appointmentDate.getDate() + (i % 7));
            appointmentDate.setHours(10 + (i % 8), 0, 0);
            const dateString = appointmentDate.toISOString().slice(0, 19).replace('T', ' ');

            const patientKey = `patient_${i % Object.keys(patientIds).length}`;
            const docKey = `doctor_${i % 2}`;

            db.run(
              'INSERT INTO appointments (patient_id, doctor_id, receptionist_id, scheduled_at, duration_minutes, status, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [patientIds[patientKey], doctorIds[docKey], userIds['receptionist_0'], dateString, 30, appointmentStatuses[i % appointmentStatuses.length], reasons[i % 4], `Appointment notes for appointment ${i + 1}`],
              function(err) {
                if (err) console.error('Error creating appointment:', err);
                appointmentsCreated++;
                if (appointmentsCreated === totalAppointments) {
                  createMedicalRecords(userIds, doctorIds, patientIds);
                }
              }
            );
          }
        }

        function createMedicalRecords(userIds, doctorIds, patientIds) {
          console.log('✅ Appointments created');
          console.log('📝 Creating medical records...');

          let recordsCreated = 0;
          const diagnoses = ['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Migraine'];
          const treatments = ['Medication', 'Lifestyle change', 'Therapy', 'Surgery'];
          const totalRecords = 6;

          for (let i = 0; i < totalRecords; i++) {
            const visitDate = new Date();
            visitDate.setDate(visitDate.getDate() - (i * 2));
            const dateString = visitDate.toISOString().slice(0, 10);

            const patientKey = `patient_${i % Object.keys(patientIds).length}`;
            const docKey = `doctor_${i % 2}`;

            db.run(
              'INSERT INTO medical_records (patient_id, doctor_id, visit_date, diagnosis, treatment, prescriptions, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [patientIds[patientKey], doctorIds[docKey], dateString, diagnoses[i % 4], treatments[i % 4], 'Lisinopril 10mg daily, Metformin 500mg twice daily, Albuterol inhaler as needed', 'Patient showed improvement. Continue current treatment plan.'],
              function(err) {
                if (err) console.error('Error creating medical record:', err);
                recordsCreated++;
                if (recordsCreated === totalRecords) {
                  createBills(userIds, doctorIds, patientIds);
                }
              }
            );
          }
        }

        function createBills(userIds, doctorIds, patientIds) {
          console.log('✅ Medical records created');
          console.log('💰 Creating bills...');

          let billsCreated = 0;
          const billStatuses = ['paid', 'issued', 'partial', 'overdue'];
          const totalBills = 5;

          for (let i = 0; i < totalBills; i++) {
            const amount = 500 + (i * 200);
            const issuedDate = new Date();
            issuedDate.setDate(issuedDate.getDate() - i);
            const issuedString = issuedDate.toISOString().slice(0, 19).replace('T', ' ');

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (30 - i * 5));
            const dueString = dueDate.toISOString().slice(0, 19).replace('T', ' ');

            const patientKey = `patient_${i % Object.keys(patientIds).length}`;
            const totalPaid = i === 1 ? amount * 0.5 : (i === 3 ? 0 : amount);

            db.run(
              'INSERT INTO bills (patient_id, created_by, total_amount, total_paid, status, issued_at, due_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [patientIds[patientKey], userIds['accountant_0'], amount, totalPaid, billStatuses[i % billStatuses.length], issuedString, dueString, 'Invoice for medical services rendered'],
              function(err) {
                if (err) {
                  console.error('Error creating bill:', err);
                  billsCreated++;
                  if (billsCreated === totalBills) {
                    seedComplete();
                  }
                  return;
                }

                const billId = this.lastID;

                
                db.run(
                  'INSERT INTO bill_items (bill_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)',
                  [billId, 'Consultation Fee', 1, 100],
                  (err) => {
                    if (err) console.error('Error creating bill item:', err);
                    db.run(
                      'INSERT INTO bill_items (bill_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)',
                      [billId, 'Medical Tests', 2, 150],
                      (err) => {
                        if (err) console.error('Error creating bill item:', err);

                        
                        if (totalPaid > 0) {
                          db.run(
                            'INSERT INTO payments (bill_id, paid_by, amount, method, transaction_ref, paid_at) VALUES (?, ?, ?, ?, ?, ?)',
                            [billId, patientIds[patientKey], totalPaid, i % 2 === 0 ? 'cash' : 'card', `TXN${billId}${Date.now()}`, new Date().toISOString().slice(0, 19).replace('T', ' ')],
                            (err) => {
                              if (err) console.error('Error creating payment:', err);
                              billsCreated++;
                              if (billsCreated === totalBills) {
                                seedComplete();
                              }
                            }
                          );
                        } else {
                          billsCreated++;
                          if (billsCreated === totalBills) {
                            seedComplete();
                          }
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        }

        function seedComplete() {
          console.log('✅ Bills and payments created');
          console.log('\n✨ Database seeding completed successfully!');
          console.log('\n📋 Test Credentials:');
          console.log('Admin: admin@hms.local / admin123');
          console.log('Doctor: dr.ahmed@hms.local / doctor123');
          console.log('Nurse: sarah@hms.local / nurse123');
          console.log('Receptionist: john@hms.local / receptionist123');
          console.log('Accountant: mike@hms.local / accountant123');
          console.log('Patient: ali@hms.local / patient123');
          console.log('\n✅ Refreshing page will show the data now!');
          
          db.close((err) => {
            if (err) console.error('Error closing database:', err);
            resolve();
          });
        }
      });
    } catch (error) {
      console.error('❌ Seeding error:', error);
      db.close();
      reject(error);
    }
  });
}

seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seed script failed');
    process.exit(1);
  });
