const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Farmhouse = require('../models/Farmhouse');
const { calculateRefundAmount, isEligibleForCancellation, REFUND_TIMELINE } = require('../utils/cancellationPolicy');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 0 // 0 = Manual Capture (Auth only), 1 = Auto Capture
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Payment initiation failed' });
    }
};

// @desc    Verify Payment and Create Booking (Pending Confirmation)
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingDetails
        } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        console.log('--- Payment Verification Debug ---');
        console.log('Received:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
        console.log('Key Secret Exists:', !!process.env.RAZORPAY_KEY_SECRET);

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        console.log('Expected Signature:', expectedSignature);
        console.log('Received Signature:', razorpay_signature);
        console.log('Match:', expectedSignature === razorpay_signature);
        console.log('----------------------------------');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment verified (Authorized), create booking with pending status
            const { farmhouseId, checkIn, checkOut, guests, totalPrice } = bookingDetails;

            const farmhouse = await Farmhouse.findById(farmhouseId);
            if (!farmhouse) {
                return res.status(404).json({ message: 'Farmhouse not found' });
            }

            // Server-side duration validation
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));

            const minStay = farmhouse.bookingPolicy?.minDuration || 1;
            const maxStay = farmhouse.bookingPolicy?.maxDuration || 30;

            if (nights < minStay || nights > maxStay) {
                return res.status(400).json({
                    message: `Booking duration (${nights} days) violates property policy (Min: ${minStay}, Max: ${maxStay})`
                });
            }

            // Generate unique receipt number and check-in code
            const receiptNumber = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;
            const checkInCode = `CHK${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            // Calculate advance payment (30%)
            const advancePayment = totalPrice * 0.30;
            const balancePayment = totalPrice - advancePayment;

            // Calculate vendor payout
            // Admin takes 5% of TOTAL price
            // User pays 30% as advance
            // Vendor Payout = Advance Payment - Admin Commission
            const commissionRate = 5; // 5% commission
            const commissionAmount = (totalPrice * commissionRate) / 100;
            const vendorPayoutAmount = advancePayment - commissionAmount;

            const booking = await Booking.create({
                user: req.user.id,
                farmhouse: farmhouseId,
                vendor: farmhouse.vendor,
                checkIn,
                checkOut,
                guests,
                totalPrice,
                status: 'pending_confirmation', // Waiting for vendor
                paymentStatus: 'authorized', // Money held
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                receiptNumber,
                checkInCode,
                advancePayment,
                balancePayment,
                vendorPayout: {
                    amount: vendorPayoutAmount,
                    commissionAmount: commissionAmount,
                    commissionRate: commissionRate,
                    status: 'pending'
                }
            });

            // Block dates tentatively
            const dates = [];
            let currentDate = new Date(checkIn);
            const endDate = new Date(checkOut);

            while (currentDate < endDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            if (dates.length > 0) {
                await Farmhouse.findByIdAndUpdate(farmhouseId, {
                    $push: { unavailableDates: { $each: dates } }
                });
            }

            // Send notification to vendor
            const { createNotification } = require('./notificationController');
            await createNotification({
                recipient: farmhouse.vendor,
                recipientModel: 'Vendor',
                type: 'booking_request',
                title: 'New Booking Request',
                message: `You have a new booking request for ${farmhouse.name} from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}`,
                booking: booking._id,
                data: { farmhouseName: farmhouse.name, guests }
            });

            // Update notification tracking
            booking.notifications.vendorNotified = true;
            await booking.save();

            res.status(201).json({
                message: 'Booking requested. Waiting for host confirmation.',
                booking,
                receiptNumber,
                checkInCode
            });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};

// @desc    Vendor Confirms Booking -> Capture Payment
// @route   POST /api/payments/capture/:bookingId
// @access  Private (Vendor Only)
const capturePayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify vendor ownership (assuming req.vendor is the vendor)
        if (booking.vendor.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'pending_confirmation') {
            return res.status(400).json({ message: 'Booking is not pending confirmation' });
        }

        // Capture Payment via Razorpay
        // Amount to capture (in paise)
        const amountToCapture = booking.totalPrice * 0.30 * 100; // Capturing the advance payment
        // Note: In createOrder we used advancePayment. We should capture that same amount.
        // Ideally, we should store the 'amountAuthorized' in the booking model to be exact.
        // For now, let's fetch the payment details from Razorpay to be safe or re-calculate.

        // Fetch payment to get amount
        const payment = await razorpay.payments.fetch(booking.paymentId);

        if (payment.status === 'captured') {
            return res.status(400).json({ message: 'Payment already captured' });
        }

        const captureResponse = await razorpay.payments.capture(booking.paymentId, payment.amount, 'INR');

        if (captureResponse.status === 'captured') {
            booking.status = 'confirmed';
            booking.paymentStatus = 'partially_paid'; // Advance paid, balance due
            booking.notifications.userConfirmationSent = true;
            booking.notifications.adminNotified = true;

            // Populate vendor for reference
            await booking.populate('vendor farmhouse user');

            // Manual Payout Logic:
            // We no longer use Razorpay Route for automatic transfers.
            // The vendorPayout field was already set during booking creation (verifyPayment).
            // We just confirm the booking here. The admin will manually pay the vendor later.

            console.log(`Booking confirmed. Vendor payout of ₹${booking.vendorPayout?.amount} is pending admin action.`);

            await booking.save();

            // Send notification to user
            const { createNotification } = require('./notificationController');
            await createNotification({
                recipient: booking.user._id,
                recipientModel: 'User',
                type: 'booking_confirmed',
                title: 'Booking Confirmed!',
                message: `Your booking for ${booking.farmhouse.name} has been confirmed by the host. Check-in code: ${booking.checkInCode}`,
                booking: booking._id,
                data: {
                    farmhouseName: booking.farmhouse.name,
                    checkInCode: booking.checkInCode,
                    balancePayment: booking.balancePayment
                }
            });

            res.json({
                message: 'Booking confirmed and payment captured',
                booking
            });
        } else {
            res.status(500).json({ message: 'Failed to capture payment' });
        }

    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ message: 'Capture failed', error: error.message });
    }
};

// @desc    Vendor Rejects Booking -> Refund/Void Payment
// @route   POST /api/payments/reject/:bookingId
// @access  Private (Vendor Only)
const rejectBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.vendor.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'pending_confirmation') {
            return res.status(400).json({ message: 'Booking is not pending confirmation' });
        }

        // Refund (or Void if not captured yet, Razorpay handles 'refund' for authorized payments as void usually, or we use specific void endpoint if needed, but refund works for authorized too in many flows. For strict Auth, 'refund' on authorized payment might fail, we might need to 'refund' or just let it expire. 
        // Actually, for authorized but not captured, we should use `razorpay.payments.refund`? No, usually it's just not capturing. 
        // But to release the hold immediately, we can try to refund.
        // Razorpay API: If you want to release the auth, you can "refund" it.

        // Check payment status and void or refund accordingly
        let refundOrVoidSuccess = false;
        try {
            // Fetch payment details from Razorpay to check its status
            const payment = await razorpay.payments.fetch(booking.paymentId);

            console.log('Payment status:', payment.status);

            if (payment.status === 'authorized') {
                // Payment is only authorized (not captured) 
                // We don't capture it – it will be automatically voided by Razorpay 
                // Alternatively, we can initiate a refund which will void the authorization
                console.log('Voiding authorized payment by initiating zero-capture or just skipping capture...');
                // To release immediately, the best way in Razorpay is to use the refund API even for authorized payments
                const refund = await razorpay.payments.refund(booking.paymentId, {
                    speed: 'normal',
                    notes: {
                        reason: 'Vendor rejection (Voiding authorization)',
                        bookingId: booking._id.toString()
                    }
                });
                console.log('Authorization voided (refund initiated):', refund.id);
                refundOrVoidSuccess = true;
            } else if (payment.status === 'captured') {
                // Payment was captured - REFUND it
                console.log('Refunding captured payment...');
                const refund = await razorpay.payments.refund(booking.paymentId, {
                    amount: booking.advancePayment * 100, // Full refund in paise
                    speed: 'normal',
                    notes: {
                        reason: 'Vendor rejection',
                        bookingId: booking._id.toString()
                    }
                });
                console.log('Refund initiated:', refund.id);
                booking.refundId = refund.id;
                booking.refundStatus = 'processed';
                booking.refundInitiatedAt = new Date();
                refundOrVoidSuccess = true;
            } else {
                console.log('Payment status is:', payment.status, '- cannot void or refund');
            }
        } catch (refundError) {
            console.error("Void/Refund error:", refundError);
            // Continue to cancel booking even if void/refund fails
        }

        booking.status = 'cancelled';
        booking.paymentStatus = refundOrVoidSuccess ? 'refunded' : 'failed';
        booking.cancelledBy = 'vendor';
        booking.cancelledAt = new Date();
        booking.refundAmount = booking.advancePayment;
        booking.cancellationReason = req.body.reason || 'Rejected by host';
        booking.notifications.userCancellationSent = true;

        // Set vendor payout as cancelled so it doesn't appear in earnings
        booking.vendorPayout.status = 'cancelled';

        await booking.save();

        // Populate for notification
        await booking.populate('farmhouse user');

        // Release dates
        const dates = [];
        let currentDate = new Date(booking.checkIn);
        const endDate = new Date(booking.checkOut);

        while (currentDate < endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (dates.length > 0) {
            await Farmhouse.findByIdAndUpdate(booking.farmhouse, {
                $pull: { unavailableDates: { $in: dates } }
            });
        }

        // Send notification to user
        const { createNotification } = require('./notificationController');
        await createNotification({
            recipient: booking.user._id,
            recipientModel: 'User',
            type: 'booking_rejected',
            title: 'Booking Request Declined',
            message: `Your booking request for ${booking.farmhouse.name} has been declined by the host. Your payment of ₹${booking.advancePayment} has been refunded.`,
            booking: booking._id,
            data: {
                farmhouseName: booking.farmhouse.name,
                refundAmount: booking.refundAmount,
                reason: booking.cancellationReason
            }
        });

        res.json({ message: 'Booking rejected and payment voided/refunded', booking });

    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({ message: 'Reject failed', error: error.message });
    }
};

// @desc    User Cancels Booking -> Process Refund
// @route   POST /api/payments/cancel/:bookingId
// @access  Private (User)
const cancelBookingByUser = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;

        const booking = await Booking.findById(bookingId)
            .populate('farmhouse', 'name')
            .populate('vendor', 'name email')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify user ownership
        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check eligibility
        const eligibility = isEligibleForCancellation(booking);
        if (!eligibility.eligible) {
            return res.status(400).json({ message: eligibility.reason });
        }

        // Calculate refund amount based on cancellation policy
        const refundCalculation = calculateRefundAmount(
            booking.advancePayment,
            booking.checkIn,
            'user'
        );

        if (refundCalculation.refundAmount === 0) {
            return res.status(400).json({
                message: 'No refund available for cancellations less than 24 hours before check-in',
                policyText: refundCalculation.policyText
            });
        }

        // Process refund/void via Razorpay
        let refundResult = null;
        if (booking.paymentId && refundCalculation.refundAmount > 0) {
            try {
                // Fetch payment details to check status
                const payment = await razorpay.payments.fetch(booking.paymentId);

                console.log('User cancellation - Payment status:', payment.status);
                console.log('Refund amount:', refundCalculation.refundAmount);

                if (payment.status === 'authorized' && refundCalculation.refundPercent === 100) {
                    // Full refund on authorized payment - VOID it
                    console.log('Voiding authorized payment (100% refund)...');
                    await razorpay.payments.fetch(booking.paymentId).void();
                    console.log('Payment voided successfully');
                    booking.refundStatus = 'processed';
                    booking.refundInitiatedAt = new Date();
                } else if (payment.status === 'captured' || (payment.status === 'authorized' && refundCalculation.refundPercent < 100)) {
                    // Partial refund or full refund on captured payment - REFUND it
                    console.log('Refunding payment...');
                    const refundAmountInPaise = refundCalculation.refundAmount * 100;
                    const refund = await razorpay.payments.refund(booking.paymentId, {
                        amount: refundAmountInPaise,
                        speed: 'normal',
                        notes: {
                            reason: reason || 'User cancellation',
                            bookingId: booking._id.toString(),
                            refundPercent: refundCalculation.refundPercent,
                            cancellationPolicy: refundCalculation.policyText
                        }
                    });

                    console.log('Refund initiated:', refund.id);
                    refundResult = refund;
                    booking.refundId = refund.id;
                    booking.refundStatus = 'processed';
                    booking.refundInitiatedAt = new Date();
                    booking.refundSpeed = 'normal';
                } else {
                    console.log('Cannot void/refund payment with status:', payment.status);
                    booking.refundStatus = 'failed';
                }
            } catch (refundError) {
                console.error('Refund/Void error:', refundError);
                console.error('Error details:', JSON.stringify(refundError, null, 2));
                // Continue with cancellation even if refund API fails
                booking.refundStatus = 'failed';
            }
        }

        // Update booking
        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        booking.cancelledBy = 'user';
        booking.cancelledAt = new Date();
        booking.refundAmount = refundCalculation.refundAmount;
        booking.cancellationReason = reason || 'Cancelled by user';

        // Calculate vendor payout based on cancellation policy
        // The vendor keeps a percentage of the advance based on timing
        const hoursToCheckIn = (new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60);
        let vendorPayoutPercentage = 0;

        if (hoursToCheckIn >= 48) {
            // 48+ hours: Guest gets 100% refund, Vendor gets 0%
            vendorPayoutPercentage = 0;
        } else if (hoursToCheckIn >= 24) {
            // 24-48 hours: Guest gets 30% refund, Vendor gets 70%
            vendorPayoutPercentage = 70;
        } else {
            // <24 hours: Guest gets 0% refund, Vendor gets 100%
            vendorPayoutPercentage = 100;
        }

        // Calculate actual vendor payout amount
        // Original vendor payout was: advancePayment - commission
        // Now vendor gets vendorPayoutPercentage% of their original payout
        const originalVendorPayout = booking.vendorPayout.amount;
        const vendorCancellationPayout = (originalVendorPayout * vendorPayoutPercentage) / 100;

        // Update vendor payout
        if (vendorPayoutPercentage === 0) {
            booking.vendorPayout.status = 'cancelled';
            booking.vendorPayout.amount = 0;
        } else {
            booking.vendorPayout.status = 'pending'; // Admin needs to pay this
            booking.vendorPayout.amount = vendorCancellationPayout;
            booking.vendorPayout.cancellationPercentage = vendorPayoutPercentage;
        }

        await booking.save();

        // Release dates
        const dates = [];
        let currentDate = new Date(booking.checkIn);
        const endDate = new Date(booking.checkOut);

        while (currentDate < endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (dates.length > 0) {
            await Farmhouse.findByIdAndUpdate(booking.farmhouse._id, {
                $pull: { unavailableDates: { $in: dates } }
            });
        }

        // Send notification to user
        const { createNotification } = require('./notificationController');
        await createNotification({
            recipient: booking.user._id,
            recipientModel: 'User',
            type: 'booking_cancelled',
            title: 'Booking Cancelled',
            message: `Your booking for ${booking.farmhouse.name} has been cancelled. Refund of ₹${refundCalculation.refundAmount} will be processed within ${REFUND_TIMELINE.NORMAL_DAYS}.`,
            booking: booking._id,
            data: {
                farmhouseName: booking.farmhouse.name,
                refundAmount: refundCalculation.refundAmount,
                refundTimeline: REFUND_TIMELINE.NORMAL_DAYS,
                policyText: refundCalculation.policyText
            }
        });

        // Send notification to vendor
        await createNotification({
            recipient: booking.vendor._id,
            recipientModel: 'Vendor',
            type: 'booking_cancelled_by_user',
            title: 'Booking Cancelled by Guest',
            message: `${booking.user.name} cancelled their booking for ${booking.farmhouse.name}.`,
            booking: booking._id,
            data: {
                farmhouseName: booking.farmhouse.name,
                userName: booking.user.name
            }
        });

        res.json({
            message: 'Booking cancelled successfully',
            booking,
            refund: {
                amount: refundCalculation.refundAmount,
                percent: refundCalculation.refundPercent,
                timeline: REFUND_TIMELINE.NORMAL_DAYS,
                policyText: refundCalculation.policyText,
                refundId: booking.refundId
            }
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Cancellation failed', error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    capturePayment,
    rejectBooking,
    cancelBookingByUser
};
