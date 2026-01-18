const express = require('express');
const {
    getDoctors, getDoctor, createDoctor, updateDoctor,
    deleteDoctor, getDoctorAvailability, createAvailabilitySlot,
    getAssignedPatients, upsertProfile
} = require('../controllers/doctorsController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(verifyToken);


router.get('/', authorize(['admin', 'doctor', 'nurse', 'receptionist', 'patient']), getDoctors);
router.get('/:id', authorize(['admin', 'doctor', 'nurse', 'receptionist', 'patient']), getDoctor);
router.get('/:doctor_id/availability', authorize(['admin', 'doctor', 'nurse', 'receptionist', 'patient']), getDoctorAvailability);


router.get('/my-patients', authorize(['doctor']), getAssignedPatients);


router.post('/profile', authorize(['doctor']), upsertProfile);


router.post('/', authorize(['admin']), createDoctor);
router.put('/:id', authorize(['admin']), updateDoctor);
router.delete('/:id', authorize(['admin']), deleteDoctor);
router.post('/:doctor_id/availability', authorize(['admin', 'doctor']), createAvailabilitySlot);

module.exports = router;