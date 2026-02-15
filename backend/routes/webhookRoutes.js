const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/webhookController');

router.post('/razorpay', handleWebhook);

module.exports = router;
