const { pool } = require('../config/db');

async function findAndDelete() {
    try {
        const [patients] = await pool.query('SELECT * FROM patients WHERE name LIKE ?', ['%Hisham%']);

        if (patients.length === 0) {
            console.log('No patient found with name containing Hisham');
            process.exit(0);
        }

        console.log('Found patients matching Hisham:');
        patients.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}, MRN: ${p.medical_record_number}, Gender: ${p.gender}`);
        });

        if (patients.length === 1) {
            const patient = patients[0];
            console.log(`Deleting single match: ${patient.name}`);
            // Delete records
            await pool.query('DELETE FROM appointments WHERE patient_id = ?', [patient.id]);
            await pool.query('DELETE FROM medical_records WHERE patient_id = ?', [patient.id]);
            await pool.query('DELETE FROM bills WHERE patient_id = ?', [patient.id]);
            await pool.query('DELETE FROM patients WHERE id = ?', [patient.id]);
            if (patient.user_id) await pool.query('DELETE FROM users WHERE id = ?', [patient.user_id]);
            console.log('Deleted successfully.');
        } else {
            console.log('Multiple matches found. Aborting safety delete. Please specify unique attribute.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findAndDelete();
