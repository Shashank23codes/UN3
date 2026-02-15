const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/vendorAuthMiddleware');
const {
    createLinkedAccount,
    getKYCStatus,
    resendKYCEmail
} = require('../controllers/kycController');

router.post('/create-linked-account', protect, createLinkedAccount);
router.get('/status', protect, getKYCStatus);
router.post('/resend-email', protect, resendKYCEmail);

module.exports = router;
