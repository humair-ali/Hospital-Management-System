const express = require('express');
const { getPatients, getPatient, createPatient, updatePatient, deletePatient } = require('../controllers/patientsController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(verifyToken);


router.get('/', authorize(['admin', 'doctor', 'nurse', 'receptionist']), getPatients);
router.get('/:id', authorize(['admin', 'doctor', 'nurse', 'receptionist', 'patient']), getPatient);


router.post('/', authorize(['admin', 'receptionist']), createPatient);


router.put('/:id', authorize(['admin', 'receptionist', 'patient']), updatePatient);


router.delete('/:id', authorize(['admin']), deletePatient);

module.exports = router;