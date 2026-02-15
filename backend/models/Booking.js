const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmhouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmhouse',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'pending_confirmation', 'checked_in'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'authorized', 'partially_paid', 'fully_paid'],
        default: 'pending'
    },
    paymentId: {
        type: String
    },
    orderId: {
        type: String
    },
    // Check-in verification
    checkInCode: {
        type: String,
        unique: true,
        sparse: true // Allows null values
    },
    checkInVerified: {
        type: Boolean,
        default: false
    },
    checkInVerifiedAt: {
        type: Date
    },
    // Payment breakdown
    advancePayment: {
        type: Number,
        default: 0
    },
    balancePayment: {
        type: Number,
        default: 0
    },
    balancePaidAt: {
        type: Date
    },
    // Receipt data
    receiptNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    // Cancellation details
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: String,
        enum: ['user', 'vendor', 'admin']
    },
    cancelledAt: {
        type: Date
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundId: {
        type: String  // Razorpay refund ID
    },
    refundStatus: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
    },
    refundInitiatedAt: {
        type: Date
    },
    refundProcessedAt: {
        type: Date
    },
    refundSpeed: {
        type: String,
        default: 'normal'  // 'normal' or 'optimum'
    },
    // Vendor payout tracking (Admin-managed)
    vendorPayout: {
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        commissionAmount: {
            type: Number,
            required: true,
            default: 0
        },
        commissionRate: {
            type: Number,
            default: 5  // 5% commission
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'processing', 'cancelled'],
            default: 'pending'
        },
        paidAt: Date,
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        paymentMethod: String,  // 'bank_transfer', 'upi', 'cash', 'other'
        transactionReference: String,  // UTR/Transaction ID
        notes: String,
        cancellationPercentage: {
            type: Number,
            default: 0  // Percentage of advance vendor gets if booking is cancelled
        }
    },
    // Notification tracking
    notifications: {
        vendorNotified: {
            type: Boolean,
            default: false
        },
        userConfirmationSent: {
            type: Boolean,
            default: false
        },
        userCancellationSent: {
            type: Boolean,
            default: false
        },
        adminNotified: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
