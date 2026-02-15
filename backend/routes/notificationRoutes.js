const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');
const { protect: protectUser } = require('../middleware/authMiddleware');
const { protect: protectVendor } = require('../middleware/vendorAuthMiddleware');

// Create a combined middleware that works for both users and vendors
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');

// Combined middleware for notification access
const protectAny = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try to find user first
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
                return next();
            }

            // If not user, try vendor
            const vendor = await Vendor.findById(decoded.id).select('-password');
            if (vendor) {
                req.vendor = vendor;
                return next();
            }

            // If not vendor, try admin
            const admin = await Admin.findById(decoded.id).select('-password');
            if (admin) {
                req.admin = admin;
                return next();
            }

            return res.status(401).json({ message: 'Not authorized, invalid token' });
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

router.get('/', protectAny, getNotifications);
router.put('/:id/read', protectAny, markAsRead);
router.put('/read-all', protectAny, markAllAsRead);
router.delete('/:id', protectAny, deleteNotification);

module.exports = router;
