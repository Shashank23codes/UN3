const express = require('express');
const router = express.Router();
const {
    createReview,
    getFarmhouseReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    addVendorResponse,
    canReview
} = require('../controllers/reviewController');
const { protect: protectUser } = require('../middleware/authMiddleware');
const { protect: protectVendor } = require('../middleware/vendorAuthMiddleware');

// Public routes
router.get('/farmhouse/:farmhouseId', getFarmhouseReviews);

// User routes
router.post('/', protectUser, createReview);
router.get('/my-reviews', protectUser, getMyReviews);
router.get('/can-review/:bookingId', protectUser, canReview);
router.put('/:id', protectUser, updateReview);
router.delete('/:id', protectUser, deleteReview);

// Vendor routes
router.post('/:id/response', protectVendor, addVendorResponse);

module.exports = router;
