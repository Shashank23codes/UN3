const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { createNotification } = require('./notificationController');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            // Notify Admins
            const admins = await Admin.find({});
            for (const admin of admins) {
                await createNotification({
                    recipient: admin._id,
                    recipientModel: 'Admin',
                    type: 'new_user_registration',
                    title: 'New User Registration',
                    message: `New user ${user.name} has registered.`,
                    data: { userId: user._id }
                });
            }

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                picture: user.picture,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.isBanned) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                picture: user.picture,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Google Auth
// @route   POST /api/users/google-auth
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { token, access_token } = req.body;
        let payload;
        let googleId;

        if (token) {
            // Handle ID Token (from standard GoogleLogin component)
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
            googleId = payload.sub;
        } else if (access_token) {
            // Handle Access Token (from custom Google Login button / useGoogleLogin hook)
            const axios = require('axios');
            const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
            payload = response.data;
            googleId = payload.sub;
        } else {
            return res.status(400).json({ message: 'No Google token provided' });
        }

        const { name, email, picture } = payload;

        let user = await User.findOne({ email });

        if (user) {
            if (user.isBanned) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            // If user exists, update googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                picture: user.picture,
                token: generateToken(user._id)
            });
        } else {
            // Create new user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt); // Random password

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                picture,
                googleId: googleId
            });

            // Notify Admins
            const admins = await Admin.find({});
            for (const admin of admins) {
                await createNotification({
                    recipient: admin._id,
                    recipientModel: 'Admin',
                    type: 'new_user_registration',
                    title: 'New User Registration',
                    message: `New user ${user.name} has registered via Google.`,
                    data: { userId: user._id }
                });
            }

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                picture: user.picture,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Google Auth Failed' });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            picture: user.picture,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:id
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const farmhouseId = req.params.id;

        if (!user.wishlist.includes(farmhouseId)) {
            user.wishlist.push(farmhouseId);
            await user.save();
        }

        res.status(200).json(user.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const farmhouseId = req.params.id;

        user.wishlist = user.wishlist.filter(id => id.toString() !== farmhouseId);
        await user.save();

        res.status(200).json(user.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.status(200).json(user.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.file) {
                user.picture = req.file.path;
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                picture: updatedUser.picture,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No account with that email exists' });
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token and set to resetPasswordToken field
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const { sendPasswordResetEmail } = require('../utils/emailService');
        const emailSent = await sendPasswordResetEmail(user.email, resetToken, 'user');

        if (emailSent) {
            res.json({ message: 'Password reset email sent successfully' });
        } else {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        // Hash the token from URL
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
    getMe,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    updateUserProfile,
    forgotPassword,
    resetPassword
};
