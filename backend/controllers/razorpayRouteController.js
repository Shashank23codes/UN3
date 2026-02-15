const Razorpay = require('razorpay');
const Vendor = require('../models/Vendor');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Linked Account for vendor
// @route   POST /api/razorpay-route/create-account
// @access  Private (Vendor)
const createLinkedAccount = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Check if account already exists
        if (vendor.razorpayLinkedAccount.accountId) {
            return res.status(400).json({
                message: 'Linked account already exists',
                accountId: vendor.razorpayLinkedAccount.accountId
            });
        }

        // Check if KYC is approved
        if (vendor.kyc.status !== 'approved') {
            return res.status(400).json({
                message: 'KYC must be approved before creating linked account'
            });
        }

        // Check if bank details are provided
        if (!vendor.bankDetails.accountNumber || !vendor.bankDetails.ifscCode) {
            return res.status(400).json({
                message: 'Bank details are required'
            });
        }

        // Create linked account on Razorpay
        const linkedAccount = await razorpay.accounts.create({
            email: vendor.email,
            phone: vendor.phone || '9999999999', // Default if not provided
            type: 'route',
            reference_id: vendor._id.toString(),
            legal_business_name: vendor.name,
            business_type: 'individual', // Can be changed based on vendor type
            contact_name: vendor.name,
            profile: {
                category: 'hospitality',
                subcategory: 'farmhouse_rental',
                addresses: {
                    registered: {
                        street1: vendor.address.street || 'NA',
                        street2: '',
                        city: vendor.address.city || 'NA',
                        state: vendor.address.state || 'NA',
                        postal_code: vendor.address.zip || '000000',
                        country: 'IN'
                    }
                }
            }
        });

        // Update vendor with linked account details
        vendor.razorpayLinkedAccount.accountId = linkedAccount.id;
        vendor.razorpayLinkedAccount.status = 'created';
        vendor.razorpayLinkedAccount.referenceId = linkedAccount.reference_id;
        vendor.razorpayLinkedAccount.createdAt = new Date();

        await vendor.save();

        res.json({
            message: 'Linked account created successfully',
            accountId: linkedAccount.id,
            status: linkedAccount.status
        });

    } catch (error) {
        console.error('Error creating linked account:', error);
        res.status(500).json({
            message: 'Failed to create linked account',
            error: error.message
        });
    }
};

// @desc    Add/Update bank account for linked account
// @route   POST /api/razorpay-route/add-bank-account
// @access  Private (Vendor)
const addBankAccount = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (!vendor.razorpayLinkedAccount.accountId) {
            return res.status(400).json({
                message: 'Linked account must be created first'
            });
        }

        const { accountNumber, ifscCode, accountHolderName } = req.body;

        if (!accountNumber || !ifscCode || !accountHolderName) {
            return res.status(400).json({
                message: 'Account number, IFSC code, and account holder name are required'
            });
        }

        // Add bank account to linked account
        const bankAccount = await razorpay.accounts.addBankAccount(
            vendor.razorpayLinkedAccount.accountId,
            {
                ifsc_code: ifscCode,
                account_number: accountNumber,
                beneficiary_name: accountHolderName
            }
        );

        // Update vendor bank details
        vendor.bankDetails.accountNumber = accountNumber;
        vendor.bankDetails.ifscCode = ifscCode;
        vendor.bankDetails.accountHolderName = accountHolderName;
        vendor.bankDetails.verified = true;
        vendor.bankDetails.verifiedAt = new Date();

        await vendor.save();

        res.json({
            message: 'Bank account added successfully',
            bankAccount: {
                id: bankAccount.id,
                status: bankAccount.status
            }
        });

    } catch (error) {
        console.error('Error adding bank account:', error);
        res.status(500).json({
            message: 'Failed to add bank account',
            error: error.message
        });
    }
};

// @desc    Get linked account status
// @route   GET /api/razorpay-route/account-status
// @access  Private (Vendor)
const getAccountStatus = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (!vendor.razorpayLinkedAccount.accountId) {
            return res.json({
                status: 'not_created',
                message: 'Linked account not created yet',
                kycStatus: vendor.kyc.status,
                bankDetailsProvided: !!(vendor.bankDetails.accountNumber && vendor.bankDetails.ifscCode)
            });
        }

        // Fetch account details from Razorpay
        const account = await razorpay.accounts.fetch(vendor.razorpayLinkedAccount.accountId);

        res.json({
            accountId: account.id,
            status: account.status,
            email: account.email,
            phone: account.phone,
            kycStatus: vendor.kyc.status,
            bankDetailsVerified: vendor.bankDetails.verified,
            commissionRate: vendor.commissionRate
        });

    } catch (error) {
        console.error('Error fetching account status:', error);
        res.status(500).json({
            message: 'Failed to fetch account status',
            error: error.message
        });
    }
};

// @desc    Activate linked account
// @route   POST /api/razorpay-route/activate
// @access  Private (Vendor)
const activateAccount = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (!vendor.razorpayLinkedAccount.accountId) {
            return res.status(400).json({
                message: 'Linked account not created'
            });
        }

        if (vendor.razorpayLinkedAccount.status === 'activated') {
            return res.status(400).json({
                message: 'Account is already activated'
            });
        }

        // Note: Actual activation might require additional steps on Razorpay's end
        // This is a placeholder for the activation process
        vendor.razorpayLinkedAccount.status = 'activated';
        vendor.razorpayLinkedAccount.activatedAt = new Date();

        await vendor.save();

        res.json({
            message: 'Account activated successfully',
            status: 'activated'
        });

    } catch (error) {
        console.error('Error activating account:', error);
        res.status(500).json({
            message: 'Failed to activate account',
            error: error.message
        });
    }
};

module.exports = {
    createLinkedAccount,
    addBankAccount,
    getAccountStatus,
    activateAccount
};
