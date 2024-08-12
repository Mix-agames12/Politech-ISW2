const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Rutas para códigos de verificación
router.post('/send-code', authController.sendCode);
router.post('/verify-code', authController.verifyCode);

// Rutas para restablecimiento de nombre de usuario
router.post('/request-username-reset', userController.requestUsernameReset);
router.post('/reset-username', userController.resetUsername);

module.exports = router;
