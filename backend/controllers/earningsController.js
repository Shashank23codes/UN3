const Booking = require('../models/Booking');

// @desc    Get vendor earnings stats
// @route   GET /api/earnings/stats
// @access  Private (Vendor)
const getEarningsStats = async (req, res) => {
    try {
        const vendorId = req.vendor.id;

        // Fetch all confirmed, completed, or checked_in bookings
        // ALSO include cancelled bookings where vendor gets a payout
        const bookings = await Booking.find({
            vendor: vendorId,
            $or: [
                {
                    status: { $in: ['confirmed', 'completed', 'checked_in'] },
                    'vendorPayout.status': { $ne: 'cancelled' }
                },
                {
                    status: 'cancelled',
                    'vendorPayout.status': 'pending',  // Cancelled but vendor gets partial payout
                    'vendorPayout.amount': { $gt: 0 }
                }
            ]
        }).sort({ createdAt: -1 }).populate('user', 'name');

        let totalEarnings = 0;
        let pendingPayouts = 0;
        const transactions = [];

        bookings.forEach(booking => {
            // Vendor Revenue = Advance (Vendor Share) + Balance (Collected at Property)
            // If split payment processed, use that. Else calculate 25% of total.

            let vendorAdvance = 0;
            if (booking.splitPayment && booking.splitPayment.vendorAmount > 0) {
                vendorAdvance = booking.splitPayment.vendorAmount;
            } else {
                // Fallback if split not processed yet (e.g. pending confirmation or old booking)
                // Assuming 25% of total is vendor's advance share
                vendorAdvance = Math.round(booking.totalPrice * 0.25);
            }

            const balanceDue = booking.balancePayment || 0;
            const totalForBooking = vendorAdvance + balanceDue;

            totalEarnings += totalForBooking;

            // Pending payouts are those in 'wallet' (advance) that haven't been settled?
            // For Razorpay Route, 'processed' means it's in their linked account.
            // So 'pending' would be if splitStatus is pending.
            if (booking.splitPayment?.splitStatus === 'pending') {
                pendingPayouts += vendorAdvance;
            }

            transactions.push({
                id: booking._id,
                date: booking.createdAt,
                guest: booking.user?.name || 'Guest',
                amount: totalForBooking,
                status: booking.status === 'completed' ? 'Settled' : 'Pending',
                type: 'Booking Revenue'
            });
        });

        res.json({
            totalEarnings,
            pendingPayouts,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getEarningsStats
};
