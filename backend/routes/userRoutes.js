const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getMe, addToWishlist, removeFromWishlist, getWishlist, updateUserProfile, forgotPassword, resetPassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:id', protect, addToWishlist);
router.delete('/wishlist/:id', protect, removeFromWishlist);
router.put('/profile', protect, upload.single('picture'), updateUserProfile);

module.exports = router;
