const Booking = require('../models/Booking');
const Farmhouse = require('../models/Farmhouse');

// @desc    Get vendor dashboard overview stats
// @route   GET /api/dashboard/stats
// @access  Private (Vendor)
const getDashboardStats = async (req, res) => {
    try {
        const vendorId = req.vendor.id;

        // 1. Total Farmhouses
        const totalFarmhouses = await Farmhouse.countDocuments({ vendor: vendorId });

        // 2. Total Bookings
        const totalBookings = await Booking.countDocuments({ vendor: vendorId });

        // 3. Recent Bookings (Last 5)
        const recentBookings = await Booking.find({ vendor: vendorId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('farmhouse', 'name')
            .populate('user', 'name');

        // 4. Earnings (Simplified for overview)
        const completedBookings = await Booking.find({
            vendor: vendorId,
            status: { $in: ['confirmed', 'completed'] }
        });

        let totalRevenue = 0;
        completedBookings.forEach(booking => {
            let vendorAdvance = 0;
            if (booking.splitPayment && booking.splitPayment.vendorAmount > 0) {
                vendorAdvance = booking.splitPayment.vendorAmount;
            } else {
                vendorAdvance = Math.round(booking.totalPrice * 0.25);
            }
            const balanceDue = booking.balancePayment || 0;
            totalRevenue += (vendorAdvance + balanceDue);
        });

        // 5. Active Listings
        const activeListings = await Farmhouse.countDocuments({ vendor: vendorId, isActive: true });

        res.json({
            totalFarmhouses,
            totalBookings,
            totalRevenue,
            activeListings,
            recentBookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDashboardStats
};
