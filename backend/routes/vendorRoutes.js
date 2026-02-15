const express = require('express');
const router = express.Router();
const {
    registerVendor,
    loginVendor,
    googleAuthVendor,
    getMe,
    updateVendorProfile,
    updateKYC,
    changePassword,
    submitKYC,
    updateBankDetails,
    getKYCStatus,
    forgotPassword,
    resetPassword,
    updatePayoutDetails,
    verifyPassword,
    updateBusinessDetails
} = require('../controllers/vendorController');
const { protect } = require('../middleware/vendorAuthMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.post('/google-auth', googleAuthVendor);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

router.put('/profile', protect, upload.single('profileImage'), updateVendorProfile);
router.put('/kyc', protect, upload.array('documents', 5), updateKYC);
router.put('/change-password', protect, changePassword);

// New KYC and Bank Details routes
router.post('/kyc/submit', protect, submitKYC);
router.put('/bank-details', protect, updateBankDetails);
router.get('/kyc-status', protect, getKYCStatus);

// Payout details route
router.put('/payout-details', protect, updatePayoutDetails);
router.put('/business-details', protect, updateBusinessDetails);
router.post('/verify-password', protect, verifyPassword);

module.exports = router;

