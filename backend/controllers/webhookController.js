const crypto = require('crypto');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const { createNotification } = require('./notificationController');

// @desc    Handle Razorpay Webhooks
// @route   POST /api/webhooks/razorpay
// @access  Public (Verified by Signature)
const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);

        if (!secret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not defined');
            return res.status(500).json({ message: 'Server Configuration Error' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid Webhook Signature');
            return res.status(400).json({ message: 'Invalid Signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`Webhook Received: ${event}`);

        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload.payment.entity);
                break;
            case 'payment.failed':
                await handlePaymentFailed(payload.payment.entity);
                break;
            case 'transfer.processed':
                await handleTransferProcessed(payload.transfer.entity);
                break;
            case 'transfer.failed':
                await handleTransferFailed(payload.transfer.entity);
                break;
            // KYC-related events
            case 'account.activated':
                await handleAccountActivated(payload.account.entity);
                break;
            case 'account.suspended':
                await handleAccountSuspended(payload.account.entity);
                break;
            case 'account.kyc.submitted':
                await handleKYCSubmitted(payload.account.entity);
                break;
            case 'account.kyc.rejected':
                await handleKYCRejected(payload.account.entity);
                break;
            default:
                console.log('Unhandled Event:', event);
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Webhook Processing Failed' });
    }
};

const handlePaymentCaptured = async (payment) => {
    try {
        const booking = await Booking.findOne({ paymentId: payment.id });
        if (booking) {
            if (booking.paymentStatus !== 'partially_paid' && booking.paymentStatus !== 'paid') {
                booking.paymentStatus = 'partially_paid'; // Assuming advance payment
                await booking.save();
                console.log(`Booking ${booking._id} payment status updated to partially_paid via webhook`);
            }
        } else {
            console.log(`Booking not found for payment ${payment.id}`);
        }
    } catch (error) {
        console.error('Error handling payment.captured:', error);
    }
};

const handlePaymentFailed = async (payment) => {
    try {
        const booking = await Booking.findOne({ paymentId: payment.id });
        if (booking) {
            booking.paymentStatus = 'failed';
            booking.status = 'cancelled'; // Or keep as pending retry?
            await booking.save();
            console.log(`Booking ${booking._id} marked as failed via webhook`);
        }
    } catch (error) {
        console.error('Error handling payment.failed:', error);
    }
};

const handleTransferProcessed = async (transfer) => {
    try {
        // Find booking by transfer ID
        const booking = await Booking.findOne({ 'splitPayment.vendorTransferId': transfer.id });
        if (booking) {
            booking.splitPayment.splitStatus = 'processed';
            booking.splitPayment.processedAt = new Date();
            await booking.save();
            console.log(`Booking ${booking._id} split payment processed via webhook`);
        }
    } catch (error) {
        console.error('Error handling transfer.processed:', error);
    }
};

const handleTransferFailed = async (transfer) => {
    try {
        const booking = await Booking.findOne({ 'splitPayment.vendorTransferId': transfer.id });
        if (booking) {
            booking.splitPayment.splitStatus = 'failed';
            booking.splitPayment.failureReason = transfer.error_description || 'Transfer failed';
            await booking.save();
            console.log(`Booking ${booking._id} split payment failed via webhook`);

            // Notify Admin
            // TODO: Add admin notification logic
        }
    } catch (error) {
        console.error('Error handling transfer.failed:', error);
    }
};

// KYC Webhook Handlers
const handleAccountActivated = async (account) => {
    try {
        const vendor = await Vendor.findOne({ 'razorpayLinkedAccount.accountId': account.id });
        if (vendor) {
            vendor.razorpayLinkedAccount.status = 'activated';
            vendor.razorpayLinkedAccount.kycStatus = 'activated';
            if (!vendor.razorpayLinkedAccount.activatedAt) {
                vendor.razorpayLinkedAccount.activatedAt = new Date();
            }
            // vendor.isVerified = true; // Removed: Admin must verify manually
            await vendor.save();

            const { sendKYCStatusEmail } = require('../utils/emailService');
            await sendKYCStatusEmail(vendor.email, vendor.name, 'approved');
            console.log(`KYC activated for vendor: ${vendor.email}`);
        }
    } catch (error) {
        console.error('Error handling account.activated:', error);
    }
};

const handleAccountSuspended = async (account) => {
    try {
        const vendor = await Vendor.findOne({ 'razorpayLinkedAccount.accountId': account.id });
        if (vendor) {
            vendor.razorpayLinkedAccount.status = 'suspended';
            vendor.razorpayLinkedAccount.kycStatus = 'rejected';
            vendor.isVerified = false;
            await vendor.save();

            const { sendKYCStatusEmail } = require('../utils/emailService');
            await sendKYCStatusEmail(vendor.email, vendor.name, 'suspended');
            console.log(`Account suspended for vendor: ${vendor.email}`);
        }
    } catch (error) {
        console.error('Error handling account.suspended:', error);
    }
};

const handleKYCSubmitted = async (account) => {
    try {
        const vendor = await Vendor.findOne({ 'razorpayLinkedAccount.accountId': account.id });
        if (vendor) {
            vendor.razorpayLinkedAccount.kycStatus = 'submitted';
            await vendor.save();
            console.log(`KYC submitted for vendor: ${vendor.email}`);
        }
    } catch (error) {
        console.error('Error handling account.kyc.submitted:', error);
    }
};

const handleKYCRejected = async (account) => {
    try {
        const vendor = await Vendor.findOne({ 'razorpayLinkedAccount.accountId': account.id });
        if (vendor) {
            vendor.razorpayLinkedAccount.kycStatus = 'rejected';
            vendor.razorpayLinkedAccount.rejectionReason =
                account.kyc?.rejection_reason || 'Not specified';
            vendor.isVerified = false;
            await vendor.save();

            const { sendKYCStatusEmail } = require('../utils/emailService');
            await sendKYCStatusEmail(
                vendor.email,
                vendor.name,
                'rejected',
                vendor.razorpayLinkedAccount.rejectionReason
            );
            console.log(`KYC rejected for vendor: ${vendor.email}`);
        }
    } catch (error) {
        console.error('Error handling account.kyc.rejected:', error);
    }
};

module.exports = {
    handleWebhook
};
