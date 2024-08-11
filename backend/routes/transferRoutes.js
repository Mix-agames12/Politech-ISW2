const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');

router.post('/', transferController.processTransfer);

module.exports = router;
