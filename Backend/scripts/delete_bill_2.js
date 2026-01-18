const { pool } = require('../config/db');

async function deleteBill(id) {
    try {
        console.log(`Deleting Bill #${id}...`);
        await pool.query('DELETE FROM bill_items WHERE bill_id = ?', [id]);
        await pool.query('DELETE FROM payments WHERE bill_id = ?', [id]);
        await pool.query('DELETE FROM bills WHERE id = ?', [id]);
        console.log(`Deleted Bill #${id}`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

deleteBill(2);
