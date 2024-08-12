const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para restablecimiento de nombre de usuario
router.post('/request-username-reset', userController.requestUsernameReset);
router.post('/reset-username', userController.resetUsername);

module.exports = router;
