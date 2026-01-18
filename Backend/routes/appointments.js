const express = require('express');
const { getAppointments, getAppointment, createAppointment, updateAppointment, cancelAppointment } = require('../controllers/appointmentsController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(verifyToken);


router.get('/', authorize(['admin', 'doctor', 'nurse', 'receptionist', 'patient']), getAppointments);
router.get('/:id', authorize(['admin', 'doctor', 'nurse', 'receptionist', 'patient']), getAppointment);


router.post('/', authorize(['admin', 'receptionist', 'patient']), createAppointment);


router.put('/:id', authorize(['admin', 'receptionist']), updateAppointment);


router.delete('/:id', authorize(['admin', 'receptionist', 'patient']), cancelAppointment);

module.exports = router;