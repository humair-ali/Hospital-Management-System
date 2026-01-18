const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const usersController = require('../controllers/usersController');

router.use(verifyToken);
router.use(authorize(['admin']));


router.get('/', usersController.listUsers);
router.get('/:id', usersController.getUser);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.put('/:id/profile', usersController.updateProfile);

module.exports = router;