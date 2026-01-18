const express = require('express');
const router = express.Router();
const { login, register, registerPatient, registerDoctor, getCurrentUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');


router.post('/login', login);
router.post('/register-patient', registerPatient); 


router.post('/register', verifyToken, authorize(['admin']), register);
router.post('/register-doctor', verifyToken, authorize(['admin']), registerDoctor);
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
