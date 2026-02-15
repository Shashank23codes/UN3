const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get vendor from the token
            req.vendor = await Vendor.findById(decoded.id).select('-password');

            if (!req.vendor) {
                return res.status(401).json({ message: 'Vendor not found' });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
