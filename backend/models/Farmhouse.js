const mongoose = require('mongoose');

const farmhouseSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Farmhouse', 'Villa', 'Cottage', 'Bungalow', 'Resort'],
        default: 'Farmhouse'
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String,
        required: true
    }],
    pricing: {
        pricePerNight: { type: Number, required: true }, // Represents price per 24 hours
        cleaningFee: { type: Number, default: 0 },
        securityDeposit: { type: Number, default: 0 }
    },
    bookingPolicy: {
        minDuration: { type: Number, default: 1 }, // Minimum booking duration in days (24h chunks)
        maxDuration: { type: Number, default: 30 }, // Maximum booking duration in days
    },
    caretaker: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' }
    },
    capacity: {
        guests: { type: Number, required: true },
        bedrooms: { type: Number, required: true },
        bathrooms: { type: Number, required: true }
    },
    rules: [{
        type: String
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    unavailableDates: [{
        type: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('Farmhouse', farmhouseSchema);
