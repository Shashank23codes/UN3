const Razorpay = require('razorpay');
const Vendor = require('../models/Vendor');
const { sendKYCEmail, sendKYCStatusEmail } = require('../utils/emailService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Linked Account
// @route   POST /api/kyc/create-linked-account
// @access  Private (Vendor)
const createLinkedAccount = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        // Check if already created
        if (vendor.razorpayLinkedAccount.accountId) {
            return res.status(400).json({
                message: 'Linked account already exists',
                kycFormUrl: vendor.razorpayLinkedAccount.kycFormUrl,
                accountId: vendor.razorpayLinkedAccount.accountId
            });
        }

        const { businessDetails, bankDetails, address } = req.body;

        // Validate required fields
        if (!businessDetails?.name || !businessDetails?.type || !businessDetails?.email ||
            !businessDetails?.phone || !businessDetails?.pan) {
            return res.status(400).json({ message: 'Missing required business details' });
        }

        if (!bankDetails?.accountNumber || !bankDetails?.ifscCode || !bankDetails?.accountHolderName) {
            return res.status(400).json({ message: 'Missing required bank details' });
        }

        if (!address?.street || !address?.city || !address?.state || !address?.zip) {
            return res.status(400).json({ message: 'Missing required address details' });
        }

        // Create linked account on Razorpay
        const account = await razorpay.accounts.create({
            email: businessDetails.email,
            phone: businessDetails.phone,
            type: 'route',
            reference_id: vendor._id.toString(),
            legal_business_name: businessDetails.name,
            business_type: businessDetails.type,
            contact_name: vendor.name,
            profile: {
                category: 'hospitality',
                subcategory: 'accommodation',
                addresses: {
                    registered: {
                        street1: address.street,
                        street2: address.street2 || '',
                        city: address.city,
                        state: address.state,
                        postal_code: address.zip,
                        country: 'IN'
                    }
                }
            },
            legal_info: {
                pan: businessDetails.pan,
                gst: businessDetails.gst || undefined
            }
        });

        // Update vendor with Razorpay details
        vendor.businessDetails = businessDetails;
        vendor.bankDetails = bankDetails;
        vendor.address = {
            street: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: 'IN'
        };
        vendor.razorpayLinkedAccount = {
            accountId: account.id,
            status: 'created',
            kycFormUrl: account.kyc_form_url || '',
            kycStatus: 'pending',
            referenceId: vendor._id.toString(),
            createdAt: new Date()
        };

        await vendor.save();

        // Send email with KYC link
        if (account.kyc_form_url) {
            await sendKYCEmail(vendor.email, vendor.name, account.kyc_form_url);
        }

        res.json({
            success: true,
            message: 'Linked account created successfully. Check your email for KYC link.',
            kycFormUrl: account.kyc_form_url,
            accountId: account.id,
            kycStatus: 'pending'
        });

    } catch (error) {
        console.error('Razorpay account creation error:', error);
        res.status(500).json({
            message: 'Failed to create linked account',
            error: error.message
        });
    }
};

// @desc    Get KYC Status
// @route   GET /api/kyc/status
// @access  Private (Vendor)
const getKYCStatus = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor.razorpayLinkedAccount.accountId) {
            return res.json({
                kycStatus: 'pending',
                accountStatus: 'pending',
                canListProperties: false,
                message: 'Please complete KYC form to start listing properties'
            });
        }

        // Fetch latest status from Razorpay
        try {
            const account = await razorpay.accounts.fetch(
                vendor.razorpayLinkedAccount.accountId
            );

            // Update local status
            const previousStatus = vendor.razorpayLinkedAccount.kycStatus;
            vendor.razorpayLinkedAccount.status = account.status;

            // Map Razorpay status to our status
            if (account.status === 'activated') {
                vendor.razorpayLinkedAccount.kycStatus = 'activated';
                if (!vendor.razorpayLinkedAccount.activatedAt) {
                    vendor.razorpayLinkedAccount.activatedAt = new Date();
                    // vendor.isVerified = true; // Removed: Admin must verify manually
                }
            } else if (account.status === 'suspended') {
                vendor.razorpayLinkedAccount.kycStatus = 'rejected';
            }

            await vendor.save();

            // Send notification if status changed
            if (previousStatus !== vendor.razorpayLinkedAccount.kycStatus &&
                vendor.razorpayLinkedAccount.kycStatus === 'activated') {
                await sendKYCStatusEmail(vendor.email, vendor.name, 'approved');
            }
        } catch (fetchError) {
            console.error('Error fetching from Razorpay:', fetchError);
            // Continue with local status if Razorpay fetch fails
        }

        res.json({
            kycStatus: vendor.razorpayLinkedAccount.kycStatus,
            accountStatus: vendor.razorpayLinkedAccount.status,
            kycFormUrl: vendor.razorpayLinkedAccount.kycFormUrl,
            canListProperties: vendor.canListProperties,
            activatedAt: vendor.razorpayLinkedAccount.activatedAt,
            rejectionReason: vendor.razorpayLinkedAccount.rejectionReason
        });

    } catch (error) {
        console.error('Error fetching KYC status:', error);
        res.status(500).json({ message: 'Failed to fetch KYC status' });
    }
};

// @desc    Resend KYC Email
// @route   POST /api/kyc/resend-email
// @access  Private (Vendor)
const resendKYCEmail = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor.razorpayLinkedAccount.kycFormUrl) {
            return res.status(400).json({
                message: 'Please create linked account first'
            });
        }

        await sendKYCEmail(
            vendor.email,
            vendor.name,
            vendor.razorpayLinkedAccount.kycFormUrl
        );

        res.json({ message: 'KYC email sent successfully' });

    } catch (error) {
        console.error('Error resending KYC email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
};

// @desc    Refresh KYC Status from Razorpay (Admin)
// @route   POST /api/admin/vendors/:id/refresh-kyc
// @access  Private (Admin)
const refreshKYCStatus = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (!vendor.razorpayLinkedAccount.accountId) {
            return res.status(400).json({ message: 'No linked account found' });
        }

        // Fetch from Razorpay
        const account = await razorpay.accounts.fetch(
            vendor.razorpayLinkedAccount.accountId
        );

        // Update status
        vendor.razorpayLinkedAccount.status = account.status;

        if (account.status === 'activated') {
            vendor.razorpayLinkedAccount.kycStatus = 'activated';
            if (!vendor.razorpayLinkedAccount.activatedAt) {
                vendor.razorpayLinkedAccount.activatedAt = new Date();
                // vendor.isVerified = true; // Removed: Admin must verify manually
            }
        } else if (account.status === 'suspended') {
            vendor.razorpayLinkedAccount.kycStatus = 'rejected';
        }

        await vendor.save();

        res.json({
            message: 'KYC status refreshed',
            kycStatus: vendor.razorpayLinkedAccount.kycStatus,
            accountStatus: vendor.razorpayLinkedAccount.status
        });

    } catch (error) {
        console.error('Error refreshing KYC status:', error);
        res.status(500).json({ message: 'Failed to refresh status' });
    }
};

module.exports = {
    createLinkedAccount,
    getKYCStatus,
    resendKYCEmail,
    refreshKYCStatus
};
