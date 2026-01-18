const express = require('express');
const { getBills, getBill, createBill, updateBill, recordPayment, getMyBills, deleteBill } = require('../controllers/billingController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(verifyToken);


router.get('/', authorize(['admin', 'accountant']), getBills);
router.get('/:id', authorize(['admin', 'accountant']), getBill);


router.get('/my-bills', authorize(['patient', 'doctor']), getMyBills);

router.post('/', authorize(['admin', 'accountant']), createBill);
router.put('/:id', authorize(['admin', 'accountant']), updateBill);
router.delete('/:id', authorize(['admin', 'accountant']), deleteBill);
router.post('/:bill_id/payments', authorize(['admin', 'accountant', 'patient']), recordPayment);

module.exports = router;