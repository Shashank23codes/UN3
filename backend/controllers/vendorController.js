const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notificationController');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new vendor
// @route   POST /api/vendors/register
// @access  Public
const registerVendor = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if vendor exists
    const vendorExists = await Vendor.findOne({ email });

    if (vendorExists) {
        return res.status(400).json({ message: 'Vendor already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create vendor
    const vendor = await Vendor.create({
        name,
        email,
        password: hashedPassword,
        phone,
    });

    if (vendor) {
        // Notify Admins
        const admins = await Admin.find({});
        for (const admin of admins) {
            await createNotification({
                recipient: admin._id,
                recipientModel: 'Admin',
                type: 'new_vendor_registration',
                title: 'New Vendor Registration',
                message: `New vendor ${vendor.name} has registered.`,
                data: { vendorId: vendor._id }
            });
        }

        res.status(201).json({
            _id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
            isVerified: vendor.isVerified,
            token: generateToken(vendor.id),
            createdAt: vendor.createdAt,
            about: vendor.about,
        });
    } else {
        res.status(400).json({ message: 'Invalid vendor data' });
    }
};

// @desc    Authenticate a vendor
// @route   POST /api/vendors/login
// @access  Public
const loginVendor = async (req, res) => {
    const { email, password } = req.body;

    // Check for vendor email
    const vendor = await Vendor.findOne({ email });

    if (vendor && (await bcrypt.compare(password, vendor.password))) {
        res.json({
            _id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
            profileImage: vendor.profileImage,
            address: vendor.address,
            isVerified: vendor.isVerified,
            token: generateToken(vendor.id),
            createdAt: vendor.createdAt,
            about: vendor.about,
            kyc: vendor.kyc,
            bankDetails: vendor.bankDetails
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Authenticate a vendor via Google
// @route   POST /api/vendors/google-auth
// @access  Public
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Authenticate a vendor via Google
// @route   POST /api/vendors/google-auth
// @access  Public
const googleAuthVendor = async (req, res) => {
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

        // Check if vendor exists
        let vendor = await Vendor.findOne({ email });

        if (vendor) {
            // If vendor exists, return token
            if (!vendor.googleId) {
                vendor.googleId = googleId;
                await vendor.save();
            }
            res.json({
                _id: vendor.id,
                name: vendor.name,
                email: vendor.email,
                phone: vendor.phone,
                profileImage: vendor.profileImage,
                address: vendor.address,
                isVerified: vendor.isVerified,
                token: generateToken(vendor.id),
                createdAt: vendor.createdAt,
                about: vendor.about,
                kyc: vendor.kyc,
                bankDetails: vendor.bankDetails
            });
        } else {
            // Create new vendor
            const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            vendor = await Vendor.create({
                name,
                email,
                password: hashedPassword,
                profileImage: picture,
                googleId: googleId,
                phone: 'Not Provided',
                isVerified: false
            });

            if (vendor) {
                // Notify Admins
                const admins = await Admin.find({});
                for (const admin of admins) {
                    await createNotification({
                        recipient: admin._id,
                        recipientModel: 'Admin',
                        type: 'new_vendor_registration',
                        title: 'New Vendor Registration',
                        message: `New vendor ${vendor.name} has registered via Google.`,
                        data: { vendorId: vendor._id }
                    });
                }

                res.status(201).json({
                    _id: vendor.id,
                    name: vendor.name,
                    email: vendor.email,
                    phone: vendor.phone,
                    profileImage: vendor.profileImage,
                    address: vendor.address,
                    isVerified: vendor.isVerified,
                    token: generateToken(vendor.id),
                    createdAt: vendor.createdAt,
                    about: vendor.about,
                    kyc: vendor.kyc,
                    bankDetails: vendor.bankDetails
                });
            } else {
                res.status(400).json({ message: 'Invalid vendor data' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Google Auth Failed' });
    }
};

// @desc    Get current vendor data
// @route   GET /api/vendors/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id).select('-password');
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private
const updateVendorProfile = async (req, res) => {
    try {
        console.log('Update Profile Request:', req.body);
        console.log('Vendor ID:', req.vendor.id);
        const vendor = await Vendor.findById(req.vendor.id);

        if (vendor) {
            vendor.name = req.body.name || vendor.name;
            vendor.phone = req.body.phone || vendor.phone;
            vendor.about = req.body.about || vendor.about;

            if (req.body.address) {
                try {
                    vendor.address = JSON.parse(req.body.address);
                } catch (e) {
                    console.error('Error parsing address:', e);
                }
            }

            if (req.file) {
                vendor.profileImage = req.file.path;
            }

            const updatedVendor = await vendor.save();

            res.json({
                _id: updatedVendor.id,
                name: updatedVendor.name,
                email: updatedVendor.email,
                phone: updatedVendor.phone,
                profileImage: updatedVendor.profileImage,
                address: updatedVendor.address,
                token: generateToken(updatedVendor.id),
                createdAt: updatedVendor.createdAt,
                about: updatedVendor.about,
                kyc: updatedVendor.kyc,
                bankDetails: updatedVendor.bankDetails
            });
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update KYC and Bank Details
// @route   PUT /api/vendors/kyc
// @access  Private
const updateKYC = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const { documentType, bankDetails } = req.body;

        if (documentType) vendor.kyc.documentType = documentType;

        if (req.files && req.files.length > 0) {
            const documentPaths = req.files.map(file => file.path);
            vendor.kyc.documents = documentPaths;
        }

        if (bankDetails) {
            vendor.bankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;
        }

        vendor.kyc.status = 'submitted';

        const updatedVendor = await vendor.save();

        res.json({
            _id: updatedVendor.id,
            name: updatedVendor.name,
            email: updatedVendor.email,
            phone: updatedVendor.phone,
            profileImage: updatedVendor.profileImage,
            address: updatedVendor.address,
            token: generateToken(updatedVendor.id),
            createdAt: updatedVendor.createdAt,
            about: updatedVendor.about,
            kyc: updatedVendor.kyc,
            bankDetails: updatedVendor.bankDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Change password
// @route   PUT /api/vendors/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (vendor.googleId) {
            return res.status(400).json({ message: 'Cannot change password for Google authenticated accounts' });
        }

        if (!(await bcrypt.compare(currentPassword, vendor.password))) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        vendor.password = await bcrypt.hash(newPassword, salt);
        await vendor.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit KYC Documents
// @route   POST /api/vendors/kyc/submit
// @access  Private
const submitKYC = async (req, res) => {
    try {
        const { pan, aadhaar, gst, cancelledCheque, businessProof } = req.body;
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Update KYC documents
        if (pan) vendor.kyc.documents.pan = pan;
        if (aadhaar) vendor.kyc.documents.aadhaar = aadhaar;
        if (gst) vendor.kyc.documents.gst = gst;
        if (cancelledCheque) vendor.kyc.documents.cancelledCheque = cancelledCheque;
        if (businessProof) vendor.kyc.documents.businessProof = businessProof;

        vendor.kyc.status = 'submitted';
        vendor.kyc.submittedAt = new Date();

        await vendor.save();

        res.json({
            message: 'KYC documents submitted successfully',
            kyc: vendor.kyc
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Bank Details
// @route   PUT /api/vendors/bank-details
// @access  Private
const updateBankDetails = async (req, res) => {
    try {
        const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
            return res.status(400).json({ message: 'All bank details are required' });
        }

        vendor.bankDetails.accountHolderName = accountHolderName;
        vendor.bankDetails.accountNumber = accountNumber;
        vendor.bankDetails.ifscCode = ifscCode;
        vendor.bankDetails.bankName = bankName;

        await vendor.save();

        res.json({
            message: 'Bank details updated successfully',
            bankDetails: vendor.bankDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get KYC Status
// @route   GET /api/vendors/kyc-status
// @access  Private
const getKYCStatus = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json({
            kycStatus: vendor.kyc.status,
            kycDocuments: vendor.kyc.documents,
            bankDetails: vendor.bankDetails,
            razorpayLinkedAccount: vendor.razorpayLinkedAccount,
            commissionRate: vendor.commissionRate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Forgot password
// @route   POST /api/vendors/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const vendor = await Vendor.findOne({ email });

        if (!vendor) {
            return res.status(404).json({ message: 'No account with that email exists' });
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token and set to resetPasswordToken field
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        vendor.resetPasswordToken = hashedToken;
        vendor.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await vendor.save();

        // Send email
        const { sendPasswordResetEmail } = require('../utils/emailService');
        const emailSent = await sendPasswordResetEmail(vendor.email, resetToken, 'vendor');

        if (emailSent) {
            res.json({ message: 'Password reset email sent successfully' });
        } else {
            vendor.resetPasswordToken = undefined;
            vendor.resetPasswordExpire = undefined;
            await vendor.save();
            res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset password
// @route   POST /api/vendors/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        // Hash the token from URL
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const vendor = await Vendor.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!vendor) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        vendor.password = await bcrypt.hash(password, salt);
        vendor.resetPasswordToken = undefined;
        vendor.resetPasswordExpire = undefined;
        await vendor.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update vendor payout details (bank/UPI)
// @route   PUT /api/vendors/payout-details
// @access  Private (Vendor)
const updatePayoutDetails = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const { bankName, accountHolderName, accountNumber, ifscCode, upiId, preferredMethod } = req.body;

        vendor.payoutDetails = {
            bankName: bankName || vendor.payoutDetails?.bankName || '',
            accountHolderName: accountHolderName || vendor.payoutDetails?.accountHolderName || '',
            accountNumber: accountNumber || vendor.payoutDetails?.accountNumber || '',
            ifscCode: ifscCode || vendor.payoutDetails?.ifscCode || '',
            upiId: upiId || vendor.payoutDetails?.upiId || '',
            preferredMethod: preferredMethod || vendor.payoutDetails?.preferredMethod || 'bank_transfer'
        };

        await vendor.save();

        res.json({
            message: 'Payout details updated successfully',
            payoutDetails: vendor.payoutDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



// @desc    Verify vendor password
// @route   POST /api/vendors/verify-password
// @access  Private
const verifyPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (vendor.googleId) {
            // Google auth users don't have a password to verify
            // In a real app, you might ask for re-auth with Google, but for now we'll just pass
            return res.json({ success: true });
        }

        if (await bcrypt.compare(password, vendor.password)) {
            res.json({ success: true });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Business Details
// @route   PUT /api/vendors/business-details
// @access  Private (Vendor)
const updateBusinessDetails = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const { name, type, email, phone, pan, gst } = req.body;

        vendor.businessDetails = {
            name: name || vendor.businessDetails?.name || '',
            type: type || vendor.businessDetails?.type || 'individual',
            email: email || vendor.businessDetails?.email || '',
            phone: phone || vendor.businessDetails?.phone || '',
            pan: pan || vendor.businessDetails?.pan || '',
            gst: gst || vendor.businessDetails?.gst || ''
        };

        await vendor.save();
        res.json({ message: 'Business details updated', businessDetails: vendor.businessDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerVendor,
    loginVendor,
    googleAuthVendor,
    getMe,
    updateVendorProfile,
    updateKYC,
    changePassword,
    submitKYC,
    updateBankDetails,
    getKYCStatus,
    forgotPassword,
    resetPassword,
    updatePayoutDetails,
    verifyPassword,
    updateBusinessDetails
};

