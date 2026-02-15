const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    picture: {
        type: String,
        default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
    },
    phone: {
        type: String,
        default: ''
    },
    googleId: {
        type: String
    },
    role: {
        type: String,
        default: 'user' // user vs admin vs vendor
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmhouse'
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
