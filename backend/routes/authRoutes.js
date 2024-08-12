const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas para códigos de verificación
router.post('/send-code', authController.sendCode);
router.post('/verify-code', authController.verifyCode);

module.exports = router;
