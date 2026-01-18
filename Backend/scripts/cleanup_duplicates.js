const { pool } = require('../config/db');

async function cleanupDuplicates() {
    try {
        console.log('Searching for duplicate bills...');
        const [bills] = await pool.query(`
            SELECT id, patient_id, total_amount, created_at, status 
            FROM bills 
            ORDER BY patient_id, created_at
        `);

        const seen = new Map();
        const duplicates = [];

        for (const bill of bills) {
            
            
            
            const key = `${bill.patient_id}-${bill.total_amount}`;

            if (seen.has(key)) {
                const existing = seen.get(key);
                
                const timeDiff = Math.abs(new Date(bill.created_at) - new Date(existing.created_at));
                if (timeDiff < 5 * 60 * 1000) { 
                    duplicates.push(bill);
                    console.log(`Found duplicate: Bill #${bill.id} matches Bill #${existing.id}`);
                }
            } else {
                seen.set(key, bill);
            }
        }

        if (duplicates.length === 0) {
            console.log('No duplicates found.');
        } else {
            console.log(`Found ${duplicates.length} duplicates. Deleting...`);
            for (const dup of duplicates) {
                console.log(`Deleting Bill #${dup.id}...`);
                await pool.query('DELETE FROM bill_items WHERE bill_id = ?', [dup.id]);
                await pool.query('DELETE FROM payments WHERE bill_id = ?', [dup.id]);
                await pool.query('DELETE FROM bills WHERE id = ?', [dup.id]);
                console.log(`Deleted Bill #${dup.id}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

cleanupDuplicates();
