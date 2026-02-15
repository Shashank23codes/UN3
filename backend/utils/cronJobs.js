const cron = require('node-cron');
const Booking = require('../models/Booking');

const initCronJobs = () => {
    // Run every minute to check for completed bookings
    cron.schedule('* * * * *', async () => {
        console.log('Running cron job: Checking for completed bookings...');
        try {
            const now = new Date();

            // Find bookings that are:
            // 1. Status is 'checked_in' or 'confirmed'
            // 2. Check-out time has passed
            // 3. Payment status is 'fully_paid' (To ensure we don't close unpaid bookings)

            const expiredBookings = await Booking.find({
                status: { $in: ['checked_in', 'confirmed'] },
                checkOut: { $lt: now },
                paymentStatus: 'fully_paid'
            });

            if (expiredBookings.length > 0) {
                console.log(`Found ${expiredBookings.length} bookings to complete.`);

                for (const booking of expiredBookings) {
                    booking.status = 'completed';
                    await booking.save();
                    console.log(`Booking ${booking._id} marked as completed.`);
                }
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
};

module.exports = initCronJobs;
