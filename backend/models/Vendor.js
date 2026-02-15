const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: ''
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    businessDetails: {
        name: { type: String, default: '' },
        type: {
            type: String,
            enum: ['individual', 'proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited'],
            default: 'individual'
        },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        pan: { type: String, default: '' },
        gst: { type: String, default: '' }
    },
    bankDetails: {
        accountHolderName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        bankName: { type: String, default: '' }
    },
    razorpayLinkedAccount: {
        accountId: { type: String, default: '' },
        status: {
            type: String,
            enum: ['pending', 'created', 'activated', 'suspended'],
            default: 'pending'
        },
        kycFormUrl: { type: String, default: '' },
        kycStatus: {
            type: String,
            enum: ['pending', 'submitted', 'activated', 'rejected'],
            default: 'pending'
        },
        referenceId: { type: String, default: '' },
        rejectionReason: { type: String, default: '' },
        createdAt: Date,
        activatedAt: Date
    },
    commissionRate: {
        type: Number,
        default: 5,                                       // Admin commission percentage (5% of advance)
        min: 0,
        max: 100
    },
    googleId: {
        type: String
    },
    // Payout details for admin-managed payments
    payoutDetails: {
        bankName: { type: String, default: '' },
        accountHolderName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        upiId: { type: String, default: '' },
        preferredMethod: {
            type: String,
            enum: ['bank_transfer', 'upi', 'other'],
            default: 'bank_transfer'
        }
    }
}, { timestamps: true });

// Virtual field to check if vendor can list properties
// Now only requires admin verification, not KYC
vendorSchema.virtual('canListProperties').get(function () {
    return this.isVerified === true;
});

// Ensure virtuals are included in JSON
vendorSchema.set('toJSON', { virtuals: true });
vendorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vendor', vendorSchema);
