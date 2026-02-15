const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Farmhouse = require('../models/Farmhouse');
const mongoose = require('mongoose');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (User)
exports.createReview = async (req, res) => {
    try {
        const { bookingId, farmhouseId, rating, cleanliness, accuracy, communication, location, valueForMoney, comment, likes, dislikes } = req.body;

        // Check if booking exists and belongs to user
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        // Check if booking is completed OR (confirmed and checkout date passed)
        const isCompleted = booking.status === 'completed';
        const isPastCheckout = new Date() > new Date(booking.checkOut);

        if (!isCompleted && !(booking.status === 'confirmed' && isPastCheckout)) {
            return res.status(400).json({ message: 'You can only review completed bookings' });
        }

        // Double check checkout date (redundant for the second case but good for safety)
        if (new Date() < new Date(booking.checkOut)) {
            return res.status(400).json({ message: 'You can review after your checkout date' });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        // Create review
        const review = await Review.create({
            farmhouse: farmhouseId,
            user: req.user._id,
            booking: bookingId,
            rating,
            cleanliness,
            accuracy,
            communication,
            location,
            valueForMoney,
            comment,
            likes,
            dislikes,
            isVerified: true // Since we verified the booking
        });

        // Update farmhouse average rating
        await updateFarmhouseRating(farmhouseId);

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name profileImage')
            .populate('farmhouse', 'name');

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get reviews for a farmhouse
// @route   GET /api/reviews/farmhouse/:farmhouseId
// @access  Public
exports.getFarmhouseReviews = async (req, res) => {
    try {
        const { farmhouseId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const reviews = await Review.find({
            farmhouse: farmhouseId,
            isHidden: false
        })
            .populate('user', 'name profileImage')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Review.countDocuments({
            farmhouse: farmhouseId,
            isHidden: false
        });

        // Calculate rating statistics
        const stats = await Review.aggregate([
            {
                $match: {
                    farmhouse: new mongoose.Types.ObjectId(farmhouseId),
                    isHidden: false
                }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    avgCleanliness: { $avg: '$cleanliness' },
                    avgAccuracy: { $avg: '$accuracy' },
                    avgCommunication: { $avg: '$communication' },
                    avgLocation: { $avg: '$location' },
                    avgValueForMoney: { $avg: '$valueForMoney' },
                    totalReviews: { $sum: 1 },
                    rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        res.json({
            reviews,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalReviews: count,
            stats: stats[0] || null
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (User)
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('farmhouse', 'name images')
            .populate('booking', 'checkIn checkOut')
            .sort('-createdAt');

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (User)
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { rating, cleanliness, accuracy, communication, location, valueForMoney, comment, likes, dislikes } = req.body;

        review.rating = rating || review.rating;
        review.cleanliness = cleanliness || review.cleanliness;
        review.accuracy = accuracy || review.accuracy;
        review.communication = communication || review.communication;
        review.location = location || review.location;
        review.valueForMoney = valueForMoney || review.valueForMoney;
        review.comment = comment || review.comment;
        review.likes = likes || review.likes;
        review.dislikes = dislikes || review.dislikes;

        await review.save();

        // Update farmhouse average rating
        await updateFarmhouseRating(review.farmhouse);

        const updatedReview = await Review.findById(review._id)
            .populate('user', 'name profileImage');

        res.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (User)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const farmhouseId = review.farmhouse;
        await review.deleteOne();

        // Update farmhouse average rating
        await updateFarmhouseRating(farmhouseId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Vendor response to review
// @route   POST /api/reviews/:id/response
// @access  Private (Vendor)
exports.addVendorResponse = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('farmhouse');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if the vendor owns this farmhouse
        if (review.farmhouse.vendor.toString() !== req.vendor._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { comment } = req.body;

        review.vendorResponse = {
            comment,
            respondedAt: new Date()
        };

        await review.save();

        const updatedReview = await Review.findById(review._id)
            .populate('user', 'name profileImage')
            .populate('farmhouse', 'name');

        res.json(updatedReview);
    } catch (error) {
        console.error('Error adding vendor response:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Check if user can review a booking
// @route   GET /api/reviews/can-review/:bookingId
// @access  Private (User)
exports.canReview = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ canReview: false, message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ canReview: false, message: 'Not your booking' });
        }

        const isCompleted = booking.status === 'completed';
        const isPastCheckout = new Date() > new Date(booking.checkOut);

        if (!isCompleted && !(booking.status === 'confirmed' && isPastCheckout)) {
            return res.status(400).json({ canReview: false, message: 'Booking not completed or checkout not passed' });
        }

        if (new Date() < new Date(booking.checkOut)) {
            return res.status(400).json({ canReview: false, message: 'Checkout date not passed' });
        }

        const existingReview = await Review.findOne({ booking: req.params.bookingId });
        if (existingReview) {
            return res.json({ canReview: false, message: 'Already reviewed', review: existingReview });
        }

        res.json({ canReview: true, booking });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Helper function to update farmhouse average rating
async function updateFarmhouseRating(farmhouseId) {
    const stats = await Review.aggregate([
        {
            $match: {
                farmhouse: new mongoose.Types.ObjectId(farmhouseId),
                isHidden: false
            }
        },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Farmhouse.findByIdAndUpdate(farmhouseId, {
            averageRating: stats[0].avgRating,
            reviewCount: stats[0].totalReviews
        });
    } else {
        await Farmhouse.findByIdAndUpdate(farmhouseId, {
            averageRating: 0,
            reviewCount: 0
        });
    }
}
