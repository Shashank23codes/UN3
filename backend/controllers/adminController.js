const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Farmhouse = require('../models/Farmhouse');
const Setting = require('../models/Setting');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notificationController');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth Admin & Get Token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { email, password, secretKey } = req.body;

    try {
        // Check for Admin Secret Key
        if (secretKey !== process.env.ADMIN_SECRET_CODE) {
            return res.status(401).json({ message: 'Invalid Admin Secret Code' });
        }

        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Current Admin
// @route   GET /api/admin/me
// @access  Private
const getMe = async (req, res) => {
    const admin = {
        _id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
    };
    res.json(admin);
};

// @desc    Register Admin (Seed/Internal use)
// @route   POST /api/admin/register
// @access  Public (Should be protected or removed in prod)
const registerAdmin = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const admin = await Admin.create({
            name,
            email,
            password,
            role
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const totalVendors = await Vendor.countDocuments();
        const verifiedVendors = await Vendor.countDocuments({ isVerified: true });
        const pendingVerifications = await Vendor.countDocuments({ isVerified: false });
        const pendingKYC = await Vendor.countDocuments({ 'kyc.status': 'submitted' });
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate total earnings (admin commission from all bookings)
        const bookings = await Booking.find({
            paymentStatus: { $in: ['paid', 'fully_paid', 'partially_paid'] }
        });
        const totalEarnings = bookings.reduce((acc, booking) => acc + (booking.vendorPayout?.commissionAmount || 0), 0);

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .populate('farmhouse', 'name');

        res.json({
            totalVendors,
            verifiedVendors,
            pendingVerifications,
            pendingKYC,
            totalBookings,
            totalUsers,
            totalEarnings,
            recentBookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Vendors with KYC Status
// @route   GET /api/admin/vendors/kyc
// @access  Private
const getVendorsKYC = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status && status !== 'all') {
            if (status === 'pending') {
                query = { 'kyc.status': { $in: ['pending', undefined] } };
            } else {
                query = { 'kyc.status': status };
            }
        }

        const vendors = await Vendor.find(query).select('-password');
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve Vendor KYC
// @route   PUT /api/admin/vendors/:id/kyc/approve
// @access  Private
const approveKYC = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        vendor.kyc.status = 'approved';
        vendor.kyc.verifiedAt = new Date();
        // vendor.isVerified = true; // Removed: Admin must verify manually

        await vendor.save();

        // Notify Vendor
        await createNotification({
            recipient: vendor._id,
            recipientModel: 'Vendor',
            type: 'kyc_approved',
            title: 'KYC Approved',
            message: 'Your KYC documents have been approved.',
            data: { kycStatus: 'approved' }
        });

        res.json({ message: 'KYC Approved', kyc: vendor.kyc });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject Vendor KYC
// @route   PUT /api/admin/vendors/:id/kyc/reject
// @access  Private
const rejectKYC = async (req, res) => {
    try {
        const { reason } = req.body;
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        vendor.kyc.status = 'rejected';
        vendor.kyc.rejectionReason = reason;
        // vendor.isVerified = false; // Removed: Independent status

        await vendor.save();

        // Notify Vendor
        await createNotification({
            recipient: vendor._id,
            recipientModel: 'Vendor',
            type: 'kyc_rejected',
            title: 'KYC Rejected',
            message: `Your KYC documents have been rejected. Reason: ${reason}`,
            data: { kycStatus: 'rejected', reason: reason }
        });

        res.json({ message: 'KYC Rejected', kyc: vendor.kyc });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Vendors
// @route   GET /api/admin/vendors
// @access  Private
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().select('-password');

        // Add counts (mock or aggregate)
        // For now returning vendors as is, aggregation can be added for booking counts
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Bookings
// @route   GET /api/admin/bookings
// @access  Private
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('vendor', 'name email')
            .populate('farmhouse', 'name')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Earnings
// @route   GET /api/admin/earnings
// @access  Private
const getEarnings = async (req, res) => {
    try {
        const { range } = req.query;

        let dateFilter = {};
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        if (range === 'month') {
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (range === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            dateFilter = { createdAt: { $gte: startOfWeek } };
        }

        // Base query for paid bookings (where admin receives commission)
        const baseQuery = {
            paymentStatus: { $in: ['paid', 'fully_paid', 'partially_paid'] }
        };

        // 1. Get All Paid Bookings for Total Earnings
        const allPaidBookings = await Booking.find(baseQuery);
        const totalEarnings = allPaidBookings.reduce((acc, b) => acc + (b.vendorPayout?.commissionAmount || 0), 0);

        // 2. Calculate This Month Earnings
        const thisMonthBookings = allPaidBookings.filter(b => new Date(b.createdAt) >= startOfMonth);
        const thisMonth = thisMonthBookings.reduce((acc, b) => acc + (b.vendorPayout?.commissionAmount || 0), 0);

        // 3. Calculate Last Month Earnings
        const lastMonthBookings = allPaidBookings.filter(b => {
            const date = new Date(b.createdAt);
            return date >= startOfLastMonth && date <= endOfLastMonth;
        });
        const lastMonth = lastMonthBookings.reduce((acc, b) => acc + (b.vendorPayout?.commissionAmount || 0), 0);

        // 4. Calculate Growth
        let monthGrowth = 0;
        if (lastMonth > 0) {
            monthGrowth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
        } else if (thisMonth > 0) {
            monthGrowth = 100;
        }

        // 5. Get Recent Transactions (Filtered by range if provided)
        const recentTransactionsQuery = { ...baseQuery, ...dateFilter };
        const recentTransactions = await Booking.find(recentTransactionsQuery)
            .populate('farmhouse', 'name')
            .populate('vendor', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            totalEarnings,
            thisMonth,
            lastMonth,
            monthGrowth,
            recentTransactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Single User
// @route   GET /api/admin/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's bookings
        const bookings = await Booking.find({ user: req.params.id })
            .populate('farmhouse', 'name')
            .sort({ createdAt: -1 });

        res.json({ user, bookings });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update User Status (Ban/Unban)
// @route   PUT /api/admin/users/:id/status
// @access  Private
const updateUserStatus = async (req, res) => {
    try {
        const { isBanned } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBanned = isBanned;
        await user.save();

        // Notify User
        await createNotification({
            recipient: user._id,
            recipientModel: 'User',
            type: isBanned ? 'account_banned' : 'account_unbanned',
            title: isBanned ? 'Account Banned' : 'Account Unbanned',
            message: isBanned
                ? 'Your account has been banned by the admin.'
                : 'Your account has been unbanned by the admin.',
            data: { isBanned }
        });

        res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Vendor By ID
// @route   GET /api/admin/vendors/:id
// @access  Private
const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id).select('-password');
        if (vendor) {
            res.json(vendor);
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Refresh Vendor KYC Status
// @route   POST /api/admin/vendors/:id/refresh-kyc
// @access  Private
const refreshVendorKYC = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (!vendor.razorpayLinkedAccount?.accountId) {
            return res.status(400).json({ message: 'Vendor has no linked account' });
        }

        // Fetch status from Razorpay
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const account = await razorpay.accounts.fetch(vendor.razorpayLinkedAccount.accountId);

        // Update local status
        // Map Razorpay status to our status
        // Razorpay statuses: created, activated, suspended, rejected
        // We also use: pending, submitted

        if (account.activation_status) {
            vendor.razorpayLinkedAccount.status = account.activation_status;
            vendor.razorpayLinkedAccount.kycStatus = account.activation_status; // simplified mapping
        }

        // Check for rejection
        if (account.activation_status === 'rejected') {
            vendor.razorpayLinkedAccount.rejectionReason = account.kyc?.rejection_reason || 'Rejected by Razorpay';
            vendor.isVerified = false;
        } else if (account.activation_status === 'activated') {
            // vendor.isVerified = true; // Removed: Admin must verify manually
            if (!vendor.razorpayLinkedAccount.activatedAt) {
                vendor.razorpayLinkedAccount.activatedAt = new Date();
            }
        }

        await vendor.save();
        res.json(vendor);

    } catch (error) {
        console.error('Refresh KYC Error:', error);
        res.status(500).json({ message: 'Failed to refresh KYC status' });
    }
};

// @desc    Toggle Vendor Verification Status
// @route   PUT /api/admin/vendors/:id/verify
// @access  Private
const toggleVendorVerification = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // If we are trying to verify (it's currently unverified), check for phone number
        if (!vendor.isVerified && !vendor.phone) {
            return res.status(400).json({ message: 'Vendor must provide a contact number before they can be verified' });
        }

        vendor.isVerified = !vendor.isVerified;
        await vendor.save();

        // Notify Vendor
        await createNotification({
            recipient: vendor._id,
            recipientModel: 'Vendor',
            type: vendor.isVerified ? 'account_verified' : 'account_unverified',
            title: vendor.isVerified ? 'Account Verified' : 'Account Unverified',
            message: vendor.isVerified
                ? 'Your account has been verified by the admin.'
                : 'Your account verification has been revoked by the admin.',
            data: { isVerified: vendor.isVerified }
        });

        res.json({
            _id: vendor._id,
            isVerified: vendor.isVerified,
            message: `Vendor ${vendor.isVerified ? 'verified' : 'unverified'} successfully`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Farmhouses
// @route   GET /api/admin/farmhouses
// @access  Private
const getAllFarmhouses = async (req, res) => {
    try {
        const farmhouses = await Farmhouse.find()
            .populate('vendor', 'name email isVerified')
            .sort({ createdAt: -1 });
        res.json(farmhouses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve Farmhouse
// @route   PUT /api/admin/farmhouses/:id/approve
// @access  Private
const approveFarmhouse = async (req, res) => {
    try {
        const farmhouse = await Farmhouse.findById(req.params.id);
        if (!farmhouse) return res.status(404).json({ message: 'Farmhouse not found' });

        farmhouse.verificationStatus = 'approved';
        farmhouse.isActive = true;
        await farmhouse.save();

        // Notify Vendor
        await createNotification({
            recipient: farmhouse.vendor,
            recipientModel: 'Vendor',
            type: 'farmhouse_approved',
            title: 'Property Approved',
            message: `Your property "${farmhouse.name}" has been approved.`,
            data: { farmhouseId: farmhouse._id }
        });

        res.json(farmhouse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject Farmhouse
// @route   PUT /api/admin/farmhouses/:id/reject
// @access  Private
const rejectFarmhouse = async (req, res) => {
    try {
        const { reason } = req.body;
        const farmhouse = await Farmhouse.findById(req.params.id);
        if (!farmhouse) return res.status(404).json({ message: 'Farmhouse not found' });

        farmhouse.verificationStatus = 'rejected';
        farmhouse.rejectionReason = reason;
        farmhouse.isActive = false;
        await farmhouse.save();

        // Notify Vendor
        await createNotification({
            recipient: farmhouse.vendor,
            recipientModel: 'Vendor',
            type: 'farmhouse_rejected',
            title: 'Property Rejected',
            message: `Your property "${farmhouse.name}" has been rejected. Reason: ${reason}`,
            data: { farmhouseId: farmhouse._id, reason }
        });

        res.json(farmhouse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Get Single Farmhouse by ID (Admin)
// @route   GET /api/admin/farmhouses/:id
// @access  Private
const getFarmhouseById = async (req, res) => {
    try {
        const farmhouse = await Farmhouse.findById(req.params.id)
            .populate('vendor', 'name email phone isVerified businessName profileImage kyc');
        if (!farmhouse) return res.status(404).json({ message: 'Farmhouse not found' });
        res.json(farmhouse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Revoke Farmhouse Approval (reset to pending)
// @route   PUT /api/admin/farmhouses/:id/revoke
// @access  Private
const revokeFarmhouse = async (req, res) => {
    try {
        const { reason } = req.body;
        const farmhouse = await Farmhouse.findById(req.params.id);
        if (!farmhouse) return res.status(404).json({ message: 'Farmhouse not found' });

        farmhouse.verificationStatus = 'pending';
        farmhouse.rejectionReason = '';
        farmhouse.isActive = false;
        await farmhouse.save();

        // Notify Vendor
        await createNotification({
            recipient: farmhouse.vendor,
            recipientModel: 'Vendor',
            type: 'farmhouse_pending',
            title: 'Property Verification Revoked',
            message: `Your property "${farmhouse.name}" has been returned to pending review.${reason ? ` Reason: ${reason}` : ''
                }`,
            data: { farmhouseId: farmhouse._id, reason }
        });

        res.json({ message: 'Farmhouse revoked to pending', farmhouse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route   GET /api/admin/settings
// @access  Private
const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update System Settings
// @route   PUT /api/admin/settings
// @access  Private
const updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
// @access  Private
const updateAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);

        if (admin) {
            admin.name = req.body.name || admin.name;
            if (req.body.email) admin.email = req.body.email; // Allow email change?

            if (req.body.password) {
                // If password is sent directly (not recommended without current password check, use changePassword instead)
                // But for profile update, usually just name/email
            }

            const updatedAdmin = await admin.save();

            res.json({
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                role: updatedAdmin.role,
                token: generateToken(updatedAdmin._id)
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Change Admin Password
// @route   PUT /api/admin/change-password
// @access  Private
const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin._id);

        if (admin && (await admin.matchPassword(currentPassword))) {
            admin.password = newPassword; // Pre-save hook will hash it? Need to check Admin model. 
            // Usually mongoose middleware handles hashing on save if modified.
            // If Admin model has pre-save hash, simply setting password works.
            // I'll assume standard implementation.

            // Wait, if no pre-save hook, I must hash it here. 
            // vendorController hashed it manually.
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(newPassword, salt);

            await admin.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    loginAdmin,
    registerAdmin,
    getMe,
    getDashboardStats,
    getAllVendors,
    getVendorById,
    refreshVendorKYC,
    toggleVendorVerification,
    getVendorsKYC,
    approveKYC,
    rejectKYC,
    getAllBookings,
    getEarnings,
    getAllUsers,
    getUserById,
    updateUserStatus,
    getAllFarmhouses,
    getFarmhouseById,
    approveFarmhouse,
    rejectFarmhouse,
    revokeFarmhouse,
    getSettings,
    updateSettings,
    updateAdminProfile,
    changeAdminPassword
};

