const Booking = require('../models/Booking');
const { createNotification } = require('./notificationController');

// @desc    Verify check-in code and mark customer as checked in
// @route   POST /api/bookings/verify-checkin
// @access  Private (Vendor)
const verifyCheckIn = async (req, res) => {
    try {
        const { checkInCode } = req.body;

        if (!checkInCode) {
            return res.status(400).json({ message: 'Check-in code is required' });
        }

        const booking = await Booking.findOne({ checkInCode })
            .populate('farmhouse', 'name')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Invalid check-in code' });
        }

        // Verify vendor ownership
        if (booking.vendor.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({
                message: `Cannot check in. Booking status is: ${booking.status}`
            });
        }

        if (booking.checkInVerified) {
            return res.status(400).json({
                message: 'Customer has already checked in',
                checkedInAt: booking.checkInVerifiedAt
            });
        }

        // Mark as checked in
        booking.checkInVerified = true;
        booking.checkInVerifiedAt = new Date();
        booking.status = 'checked_in';
        await booking.save();

        // Send notification to user
        await createNotification({
            recipient: booking.user._id,
            recipientModel: 'User',
            type: 'check_in_verified',
            title: 'Check-in Successful',
            message: `You have successfully checked in to ${booking.farmhouse.name}. Enjoy your stay!`,
            booking: booking._id,
            data: {
                farmhouseName: booking.farmhouse.name,
                balancePayment: booking.balancePayment
            }
        });

        res.json({
            message: 'Check-in verified successfully',
            booking,
            customer: {
                name: booking.user.name,
                email: booking.user.email,
                phone: booking.user.phone
            },
            balancePayment: booking.balancePayment
        });
    } catch (error) {
        console.error('Error verifying check-in:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Record balance payment at property
// @route   POST /api/bookings/:id/balance-payment
// @access  Private (Vendor)
const recordBalancePayment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('farmhouse', 'name')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify vendor ownership
        if (booking.vendor.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'checked_in') {
            return res.status(400).json({
                message: 'Customer must check in first before balance payment'
            });
        }

        if (booking.paymentStatus === 'fully_paid') {
            return res.status(400).json({ message: 'Balance already paid' });
        }

        // Record balance payment
        booking.paymentStatus = 'fully_paid';
        booking.balancePaidAt = new Date();
        await booking.save();

        // Send notification to user
        await createNotification({
            recipient: booking.user._id,
            recipientModel: 'User',
            type: 'payment_received',
            title: 'Payment Received',
            message: `Balance payment of ₹${booking.balancePayment} received for ${booking.farmhouse.name}. Thank you!`,
            booking: booking._id,
            data: {
                farmhouseName: booking.farmhouse.name,
                balancePayment: booking.balancePayment
            }
        });

        res.json({
            message: 'Balance payment recorded successfully',
            booking
        });
    } catch (error) {
        console.error('Error recording balance payment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark booking as completed
// @route   PUT /api/bookings/:id/complete
// @access  Private (Vendor)
const completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify vendor ownership
        if (booking.vendor.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.paymentStatus !== 'fully_paid') {
            return res.status(400).json({
                message: 'Cannot complete booking. Balance payment not received'
            });
        }

        booking.status = 'completed';
        await booking.save();

        res.json({
            message: 'Booking marked as completed',
            booking
        });
    } catch (error) {
        console.error('Error completing booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get booking receipt
// @route   GET /api/bookings/receipt/:receiptNumber
// @access  Private
const getReceipt = async (req, res) => {
    try {
        const { receiptNumber } = req.params;

        const booking = await Booking.findOne({ receiptNumber })
            .populate('farmhouse', 'name location images')
            .populate('vendor', 'name email phone')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        // Verify user or vendor ownership
        const userId = req.user?.id;
        const vendorId = req.vendor?.id;

        if (userId && booking.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (vendorId && booking.vendor._id.toString() !== vendorId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            receipt: {
                receiptNumber: booking.receiptNumber,
                bookingId: booking._id,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                farmhouse: {
                    name: booking.farmhouse.name,
                    location: booking.farmhouse.location,
                    image: booking.farmhouse.images[0]
                },
                vendor: {
                    name: booking.vendor.name,
                    email: booking.vendor.email,
                    phone: booking.vendor.phone
                },
                customer: {
                    name: booking.user.name,
                    email: booking.user.email,
                    phone: booking.user.phone
                },
                dates: {
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut
                },
                guests: booking.guests,
                payment: {
                    totalPrice: booking.totalPrice,
                    advancePayment: booking.advancePayment,
                    balancePayment: booking.balancePayment,
                    balancePaidAt: booking.balancePaidAt
                },
                checkInCode: booking.status === 'confirmed' || booking.status === 'checked_in' ? booking.checkInCode : null, // Hide check-in code if not confirmed
                checkInVerified: booking.checkInVerified,
                checkInVerifiedAt: booking.checkInVerifiedAt,
                cancellation: booking.status === 'cancelled' ? {
                    cancelledBy: booking.cancelledBy,
                    cancelledAt: booking.cancelledAt,
                    reason: booking.cancellationReason,
                    refundAmount: booking.refundAmount
                } : null,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching receipt:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    verifyCheckIn,
    recordBalancePayment,
    completeBooking,
    getReceipt
};
