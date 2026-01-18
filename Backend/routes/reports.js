const express = require('express');
const { getDailyReport, getMonthlyReport, getAnnualReport } = require('../controllers/reportsController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(verifyToken);


router.get('/daily', authorize(['admin', 'accountant', 'doctor']), getDailyReport);
router.get('/monthly', authorize(['admin', 'accountant']), getMonthlyReport);
router.get('/annual', authorize(['admin', 'accountant']), getAnnualReport);

module.exports = router;