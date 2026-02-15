const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    platformCommission: { type: Number, default: 10 },
    minBookingHours: { type: Number, default: 24 },
    maxAdvanceBookingDays: { type: Number, default: 90 },
    cancellationDeadlineHours: { type: Number, default: 48 },
    vendorPayoutPercentage: { type: Number, default: 90 },
    autoApproveVendors: { type: Boolean, default: false },
    autoApproveFarmhouses: { type: Boolean, default: false },
    enableEmailNotifications: { type: Boolean, default: true },
    enablePushNotifications: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    allowGuestCheckout: { type: Boolean, default: false },
    minWithdrawalAmount: { type: Number, default: 1000 },
    payoutProcessingDays: { type: Number, default: 7 }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
