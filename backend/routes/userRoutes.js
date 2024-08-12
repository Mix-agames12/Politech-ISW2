const express = require('express');
const { requestUsernameReset } = require('../controllers/userController');

const router = express.Router();

router.post('/request-username-reset', requestUsernameReset);

module.exports = router;
