const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const records = require('../controllers/medicalRecordsController');

router.use(verifyToken);


router.get('/', authorize(['admin', 'doctor', 'nurse', 'patient']), records.listRecords);
router.get('/:id', authorize(['admin', 'doctor', 'nurse', 'patient']), records.getRecord);


router.post('/', authorize(['admin', 'doctor']), records.createRecord);


router.put('/:id', authorize(['admin', 'doctor', 'nurse']), records.updateRecord);


router.delete('/:id', authorize(['admin']), records.deleteRecord);

module.exports = router;