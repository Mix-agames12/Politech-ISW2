const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/process-payment', paymentController.processPayment);

module.exports = router;
