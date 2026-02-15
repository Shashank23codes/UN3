const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');

// @desc    Get all pending vendor payouts
// @route   GET /api/admin/payouts/pending
// @access  Private (Admin)
const getPendingPayouts = async (req, res) => {
    try {
        const pendingBookings = await Booking.find({
            paymentStatus: { $in: ['paid', 'fully_paid', 'partially_paid'] },
            'vendorPayout.status': 'pending'
        })
            .populate('vendor', 'name email phone payoutDetails')
            .populate('farmhouse', 'name')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(pendingBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get payouts for specific vendor
// @route   GET /api/admin/payouts/vendor/:vendorId
// @access  Private (Admin)
const getVendorPayouts = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { status } = req.query; // 'pending', 'paid', 'all'

        let query = {
            vendor: vendorId,
            paymentStatus: { $in: ['paid', 'fully_paid', 'partially_paid'] }
        };

        if (status && status !== 'all') {
            query['vendorPayout.status'] = status;
        }

        const bookings = await Booking.find(query)
            .populate('farmhouse', 'name')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark payout as paid
// @route   POST /api/admin/payouts/:bookingId/mark-paid
// @access  Private (Admin)
const markPayoutAsPaid = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { paymentMethod, transactionReference, notes } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.vendorPayout.status === 'paid') {
            return res.status(400).json({ message: 'Payout already marked as paid' });
        }

        booking.vendorPayout.status = 'paid';
        booking.vendorPayout.paidAt = new Date();
        booking.vendorPayout.paidBy = req.admin.id;
        booking.vendorPayout.paymentMethod = paymentMethod;
        booking.vendorPayout.transactionReference = transactionReference;
        booking.vendorPayout.notes = notes || '';

        await booking.save();

        res.json({
            message: 'Payout marked as paid successfully',
            booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get payout summary
// @route   GET /api/admin/payouts/summary
// @access  Private (Admin)
const getPayoutSummary = async (req, res) => {
    try {
        // Total pending amount
        const pendingPayouts = await Booking.aggregate([
            {
                $match: {
                    paymentStatus: { $in: ['paid', 'fully_paid', 'partially_paid'] },
                    'vendorPayout.status': 'pending'
                }
            },
            {
                $group: {
                    _id: null,
                    totalPending: { $sum: '$vendorPayout.amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Total paid this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const paidThisMonth = await Booking.aggregate([
            {
                $match: {
                    'vendorPayout.status': 'paid',
                    'vendorPayout.paidAt': { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: '$vendorPayout.amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Vendors awaiting payment
        const vendorsWithPending = await Booking.aggregate([
            {
                $match: {
                    paymentStatus: { $in: ['paid', 'fully_paid', 'partially_paid'] },
                    'vendorPayout.status': 'pending'
                }
            },
            {
                $group: {
                    _id: '$vendor',
                    pendingAmount: { $sum: '$vendorPayout.amount' },
                    bookingCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vendorInfo'
                }
            },
            {
                $unwind: '$vendorInfo'
            },
            {
                $project: {
                    vendorId: '$_id',
                    vendorName: '$vendorInfo.name',
                    vendorEmail: '$vendorInfo.email',
                    pendingAmount: 1,
                    bookingCount: 1
                }
            },
            {
                $sort: { pendingAmount: -1 }
            }
        ]);

        res.json({
            pending: {
                totalAmount: pendingPayouts[0]?.totalPending || 0,
                count: pendingPayouts[0]?.count || 0
            },
            paidThisMonth: {
                totalAmount: paidThisMonth[0]?.totalPaid || 0,
                count: paidThisMonth[0]?.count || 0
            },
            vendorsWithPending
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getPendingPayouts,
    getVendorPayouts,
    markPayoutAsPaid,
    getPayoutSummary
};
