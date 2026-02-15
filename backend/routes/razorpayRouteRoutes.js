const express = require('express');
const router = express.Router();
const {
    createLinkedAccount,
    addBankAccount,
    getAccountStatus,
    activateAccount
} = require('../controllers/razorpayRouteController');
const { protect: protectVendor } = require('../middleware/vendorAuthMiddleware');

router.post('/create-account', protectVendor, createLinkedAccount);
router.post('/add-bank-account', protectVendor, addBankAccount);
router.get('/account-status', protectVendor, getAccountStatus);
router.post('/activate', protectVendor, activateAccount);

module.exports = router;
