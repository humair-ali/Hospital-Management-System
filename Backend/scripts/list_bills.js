const { pool } = require('../config/db');

async function listBills() {
    try {
        const [bills] = await pool.query(`
            SELECT b.id, b.patient_id, p.name as patient_name, b.total_amount, b.created_at, b.status 
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            ORDER BY b.created_at DESC
            LIMIT 20
        `);

        console.table(bills.map(b => ({
            id: b.id,
            patient: b.patient_name,
            amount: b.total_amount,
            date: new Date(b.created_at).toLocaleString(),
            status: b.status
        })));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listBills();
