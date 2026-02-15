const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    farmhouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmhouse',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    cleanliness: {
        type: Number,
        min: 1,
        max: 5
    },
    accuracy: {
        type: Number,
        min: 1,
        max: 5
    },
    communication: {
        type: Number,
        min: 1,
        max: 5
    },
    location: {
        type: Number,
        min: 1,
        max: 5
    },
    valueForMoney: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    likes: {
        type: [String], // Array of things user liked
        default: []
    },
    dislikes: {
        type: [String], // Array of things user disliked
        default: []
    },
    vendorResponse: {
        comment: {
            type: String,
            trim: true,
            maxlength: 500
        },
        respondedAt: {
            type: Date
        }
    },
    isVerified: {
        type: Boolean,
        default: false // True if user actually stayed (completed booking)
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    reportCount: {
        type: Number,
        default: 0
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
reviewSchema.index({ farmhouse: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });

// Prevent duplicate reviews per booking
reviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
