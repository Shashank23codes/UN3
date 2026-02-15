const express = require('express');
const router = express.Router();
const {
    loginAdmin,
    registerAdmin,
    getMe,
    getDashboardStats,
    getVendorsKYC,
    approveKYC,
    rejectKYC,
    getAllVendors,
    getVendorById,
    refreshVendorKYC,
    toggleVendorVerification,
    getAllBookings,
    getEarnings,
    getAllUsers,
    getUserById,
    updateUserStatus,
    getAllFarmhouses,
    approveFarmhouse,
    rejectFarmhouse,
    getSettings,
    updateSettings,
    updateAdminProfile,
    changeAdminPassword
} = require('../controllers/adminController');
const {
    getPendingPayouts,
    getVendorPayouts,
    markPayoutAsPaid,
    getPayoutSummary
} = require('../controllers/payoutController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

// Public routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin); // Keep for initial seeding

// Protected routes
router.get('/me', protectAdmin, getMe);
router.put('/profile', protectAdmin, updateAdminProfile);
router.put('/change-password', protectAdmin, changeAdminPassword);
router.get('/dashboard/stats', protectAdmin, getDashboardStats);

// User Management
router.get('/users', protectAdmin, getAllUsers);
router.get('/users/:id', protectAdmin, getUserById);
router.put('/users/:id/status', protectAdmin, updateUserStatus);

// Vendor Management
router.get('/vendors', protectAdmin, getAllVendors);
router.get('/vendors/:id', protectAdmin, getVendorById);
router.put('/vendors/:id/verify', protectAdmin, toggleVendorVerification);
router.post('/vendors/:id/refresh-kyc', protectAdmin, refreshVendorKYC);

// Farmhouse Management
router.get('/farmhouses', protectAdmin, getAllFarmhouses);
router.put('/farmhouses/:id/approve', protectAdmin, approveFarmhouse);
router.put('/farmhouses/:id/reject', protectAdmin, rejectFarmhouse);

// System Settings
router.get('/settings', protectAdmin, getSettings);
router.put('/settings', protectAdmin, updateSettings);

// Payout Management
router.get('/payouts/pending', protectAdmin, getPendingPayouts);
router.get('/payouts/summary', protectAdmin, getPayoutSummary);
router.get('/payouts/vendor/:vendorId', protectAdmin, getVendorPayouts);
router.post('/payouts/:bookingId/mark-paid', protectAdmin, markPayoutAsPaid);

// General Management
router.get('/bookings', protectAdmin, getAllBookings);
router.get('/earnings', protectAdmin, getEarnings);

module.exports = router;

