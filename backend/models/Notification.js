const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['User', 'Vendor', 'Admin']
    },
    type: {
        type: String,
        required: true,
        enum: [
            'booking_request',
            'booking_confirmed',
            'booking_rejected',
            'booking_cancelled',
            'payment_received',
            'check_in_reminder',
            'check_in_verified',
            'balance_payment_reminder',
            'new_user_registration',
            'new_vendor_registration',
            'account_verified',
            'account_unverified',
            'account_banned',
            'account_unbanned',
            'kyc_approved',
            'kyc_rejected'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
