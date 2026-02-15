const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, capturePayment, rejectBooking, cancelBookingByUser } = require('../controllers/paymentController');
const { protect: protectUser } = require('../middleware/authMiddleware');
const { protect: protectVendor } = require('../middleware/vendorAuthMiddleware');

router.post('/create-order', protectUser, createOrder);
router.post('/verify', protectUser, verifyPayment);
router.post('/cancel/:bookingId', protectUser, cancelBookingByUser);
router.post('/capture/:bookingId', protectVendor, capturePayment);
router.post('/reject/:bookingId', protectVendor, rejectBooking);

module.exports = router;
