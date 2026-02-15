const Booking = require('../models/Booking');
const Farmhouse = require('../models/Farmhouse');
const { createNotification } = require('./notificationController');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { farmhouseId, checkIn, checkOut, guests, totalPrice } = req.body;

        const farmhouse = await Farmhouse.findById(farmhouseId);
        if (!farmhouse) {
            return res.status(404).json({ message: 'Farmhouse not found' });
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
            status: 'pending_confirmation', // Changed from confirmed to allow vendor approval
            paymentStatus: 'pending',
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

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('farmhouse')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get vendor bookings
// @route   GET /api/bookings/vendor-bookings
// @access  Private (Vendor)
const getVendorBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ vendor: req.vendor.id })
            .populate('farmhouse')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Vendor)
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('farmhouse')
            .populate('user', 'name email phone')
            .populate('vendor', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if the vendor owns this booking
        if (booking.vendor._id.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Accept a booking
// @route   PUT /api/bookings/:id/accept
// @access  Private (Vendor)
const acceptBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if the vendor owns this booking
        if (booking.vendor.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized to accept this booking' });
        }

        if (booking.status !== 'pending_confirmation') {
            return res.status(400).json({ message: 'Booking is not in pending confirmation state' });
        }

        booking.status = 'confirmed';
        await booking.save();

        // Notify User
        await createNotification({
            recipient: booking.user,
            recipientModel: 'User',
            type: 'booking_accepted',
            title: 'Booking Accepted',
            message: 'Your booking has been accepted by the vendor!',
            data: { bookingId: booking._id }
        });

        res.json({ message: 'Booking accepted successfully', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject a booking
// @route   PUT /api/bookings/:id/reject
// @access  Private (Vendor)
const rejectBooking = async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if the vendor owns this booking
        if (booking.vendor.toString() !== req.vendor.id) {
            return res.status(403).json({ message: 'Not authorized to reject this booking' });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Rejected by vendor';
        booking.cancelledBy = 'vendor';
        booking.cancelledAt = new Date();
        await booking.save();

        // Notify User
        await createNotification({
            recipient: booking.user,
            recipientModel: 'User',
            type: 'booking_rejected',
            title: 'Booking Rejected',
            message: `Your booking has been rejected by the vendor. Reason: ${booking.cancellationReason}`,
            data: { bookingId: booking._id }
        });

        res.json({ message: 'Booking rejected successfully', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getVendorBookings,
    getBookingById,
    acceptBooking,
    rejectBooking
};
