const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getVendorBookings,
    getBookingById,
    acceptBooking,
    rejectBooking
} = require('../controllers/bookingController');
const { verifyCheckIn, recordBalancePayment, completeBooking, getReceipt } = require('../controllers/checkInController');
const { protect: protectUser } = require('../middleware/authMiddleware');
const { protect: protectVendor } = require('../middleware/vendorAuthMiddleware');

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// Combined middleware for receipt access
const protectBoth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try to find user first
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
                return next();
            }

            // If not user, try vendor
            const vendor = await Vendor.findById(decoded.id).select('-password');
            if (vendor) {
                req.vendor = vendor;
                return next();
            }

            return res.status(401).json({ message: 'Not authorized, invalid token' });
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// User routes
router.post('/', protectUser, createBooking);
router.get('/my-bookings', protectUser, getMyBookings);

// Vendor routes
router.get('/vendor-bookings', protectVendor, getVendorBookings);
router.get('/:id', protectVendor, getBookingById);
router.post('/verify-checkin', protectVendor, verifyCheckIn);
router.post('/:id/balance-payment', protectVendor, recordBalancePayment);
router.put('/:id/complete', protectVendor, completeBooking);
router.put('/:id/accept', protectVendor, acceptBooking);
router.put('/:id/reject', protectVendor, rejectBooking);

// Receipt route (accessible by both user and vendor)
router.get('/receipt/:receiptNumber', protectBoth, getReceipt);

module.exports = router;
