// Cancellation Policy Constants and Helper Functions

const CANCELLATION_POLICY = {
    FULL_REFUND_HOURS: 48,      // 48+ hours before check-in = 100% refund
    PARTIAL_REFUND_HOURS: 24,   // 24-48 hours before check-in = 30% refund
    NO_REFUND_HOURS: 0,         // Less than 24 hours = no refund

    FULL_REFUND_PERCENT: 100,
    PARTIAL_REFUND_PERCENT: 30, // Updated from 50 to 30
    NO_REFUND_PERCENT: 0,

    PAYMENT_PROCESSING_FEE_PERCENT: 2  // Razorpay processing fee
};

const REFUND_TIMELINE = {
    NORMAL_DAYS: '5-7 business days',
    INSTANT_TEXT: 'Instant (if supported by your bank)'
};

/**
 * Calculate refund amount based on cancellation policy
 * @param {Number} totalAmount - Original payment amount
 * @param {Date} checkInDate - Check-in date of booking
 * @param {String} cancelledBy - Who cancelled: 'user' or 'vendor'
 * @returns {Object} { refundAmount, refundPercent, policyText }
 */
const calculateRefundAmount = (totalAmount, checkInDate, cancelledBy = 'user') => {
    // Vendor rejection always gets full refund
    if (cancelledBy === 'vendor') {
        return {
            refundAmount: totalAmount,
            refundPercent: 100,
            policyText: 'Full refund - Booking rejected by host'
        };
    }

    const now = new Date();
    const checkIn = new Date(checkInDate);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    let refundPercent = CANCELLATION_POLICY.NO_REFUND_PERCENT;
    let policyText = '';

    if (hoursUntilCheckIn >= CANCELLATION_POLICY.FULL_REFUND_HOURS) {
        refundPercent = CANCELLATION_POLICY.FULL_REFUND_PERCENT;
        policyText = `Full refund - Cancelled more than 48 hours before check-in`;
    } else if (hoursUntilCheckIn >= CANCELLATION_POLICY.PARTIAL_REFUND_HOURS) {
        refundPercent = CANCELLATION_POLICY.PARTIAL_REFUND_PERCENT;
        policyText = `30% refund - Cancelled between 24-48 hours before check-in`;
    } else {
        refundPercent = CANCELLATION_POLICY.NO_REFUND_PERCENT;
        policyText = `No refund - Cancelled less than 24 hours before check-in`;
    }

    const refundAmount = Math.round((totalAmount * refundPercent) / 100);

    return {
        refundAmount,
        refundPercent,
        policyText,
        hoursUntilCheckIn: Math.round(hoursUntilCheckIn)
    };
};

/**
 * Get cancellation policy text for display
 * @returns {String} Policy description
 */
const getCancellationPolicyText = () => {
    return `Cancellation Policy:
    
• Cancel 48+ hours before check-in: 100% refund
• Cancel 24-48 hours before check-in: 30% refund
• Cancel less than 24 hours before check-in: Non-refundable

All refunds are processed within ${REFUND_TIMELINE.NORMAL_DAYS}.`;
};

/**
 * Check if booking is eligible for cancellation
 * @param {Object} booking - Booking object
 * @returns {Object} { eligible, reason }
 */
const isEligibleForCancellation = (booking) => {
    if (booking.status === 'cancelled') {
        return { eligible: false, reason: 'Booking is already cancelled' };
    }

    if (booking.status === 'completed') {
        return { eligible: false, reason: 'Cannot cancel a completed booking' };
    }

    if (booking.status === 'checked_in') {
        return { eligible: false, reason: 'Cannot cancel after check-in' };
    }

    const now = new Date();
    const checkIn = new Date(booking.checkIn);

    if (now >= checkIn) {
        return { eligible: false, reason: 'Cannot cancel after check-in date has passed' };
    }

    return { eligible: true, reason: null };
};

module.exports = {
    CANCELLATION_POLICY,
    REFUND_TIMELINE,
    calculateRefundAmount,
    getCancellationPolicyText,
    isEligibleForCancellation
};
