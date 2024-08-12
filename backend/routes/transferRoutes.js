const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');

router.post('/process-transfer', transferController.processTransfer);

module.exports = router;
