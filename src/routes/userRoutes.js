const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/users', validateUser, userController.createUser);
router.get('/users/:id', auth, userController.getUser);
router.post('/users/login', userController.login);

module.exports = router;