const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para códigos de verificación
router.post('/send-code', userController.sendCode);
router.post('/verify-code', userController.verifyCode);

module.exports = router;
