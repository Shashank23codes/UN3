/**
 * Vendor Payout Policy
 * 
 * This defines the terms and conditions for vendor payouts on the UtsavNest platform.
 */

const PAYOUT_POLICY = {
    // Commission Structure
    COMMISSION: {
        PLATFORM_COMMISSION_RATE: 5, // 5% platform commission on total booking amount
        DESCRIPTION: 'UtsavNest charges a 5% commission on the total booking value to cover platform operations, marketing, and transaction processing.'
    },

    // Payment Split
    PAYMENT_SPLIT: {
        ADVANCE_PAYMENT_PERCENTAGE: 30, // User pays 30% advance
        BALANCE_PAYMENT_PERCENTAGE: 70,  // User pays 70% at venue
        ADVANCE_PAYOUT_CALCULATION: 'Advance Payment (30% of total) - Platform Commission (5% of total) = Vendor Advance Payout',
        BALANCE_PAYOUT: 'Balance payment (70%) is collected by vendor directly at the property'
    },

    // Payout Timeline
    PAYOUT_SCHEDULE: {
        ADVANCE_PAYOUT: {
            TRIGGER: '3 days before guest check-in date',
            PROCESSING_TIME: 'Processed automatically 3 days before check-in',
            METHOD: 'Admin-managed transfer to vendor\'s registered bank account',
            STATUS: 'Shown as "Pending" until 3 days before check-in, then processed',
            RATIONALE: 'Aligns with cancellation policy - protects both vendor and guest'
        },
        BALANCE_PAYOUT: {
            COLLECTION: 'Collected directly from guest at check-in',
            RESPONSIBILITY: 'Vendor collects balance payment (70%) directly from guest',
            PLATFORM_INVOLVEMENT: 'No platform deduction on balance payment'
        }
    },

    // Payout Conditions
    CONDITIONS: {
        KYC_VERIFICATION: 'Vendor must complete KYC verification to receive payouts',
        BANK_DETAILS: 'Valid bank account details must be provided',
        BOOKING_CONFIRMATION: 'Booking must be confirmed by vendor',
        PAYOUT_TIMING: 'Advance payout processed 3 days before guest check-in',
        CANCELLATION_PROTECTION: 'Payout timing aligned with cancellation policy for fair protection',
        GUEST_CHECKIN: 'Balance payment collection happens at guest check-in'
    },

    // Cancellation Impact (Aligned with Payout Timing)
    CANCELLATION_POLICY: {
        VENDOR_REJECTION: 'No payout if vendor rejects the booking',
        CANCELLATION_BEFORE_PAYOUT: 'If user cancels >3 days before check-in: 100% refund to user, no payout to vendor (payout not yet processed)',
        CANCELLATION_AFTER_PAYOUT: 'If user cancels 24-48h before check-in: 50% refund to user, vendor keeps 50% of advance',
        CANCELLATION_LAST_MINUTE: 'If user cancels <24h before check-in: 30% refund to user, vendor keeps 70% of advance',
        RATIONALE: 'Payout at 3 days before check-in aligns with 48-hour cancellation policy threshold'
    },

    // Minimum Payout Threshold
    MINIMUM_PAYOUT: {
        AMOUNT: 0, // No minimum threshold currently
        NOTE: 'Payouts are processed for all confirmed bookings regardless of amount'
    },

    // Payout Methods
    PAYOUT_METHODS: {
        SUPPORTED: ['Bank Transfer', 'UPI'],
        PRIMARY: 'Bank Transfer',
        REQUIREMENTS: {
            BANK_TRANSFER: ['Account Holder Name', 'Account Number', 'IFSC Code', 'Bank Name'],
            UPI: ['UPI ID']
        }
    },

    // Reporting & Transparency
    REPORTING: {
        EARNINGS_DASHBOARD: 'Vendors can view real-time earnings in the dashboard',
        TRANSACTION_HISTORY: 'Detailed breakdown of each booking and payout',
        PAYOUT_STATUS: 'Track status of pending and paid payouts',
        NOTIFICATIONS: 'Email/in-app notifications for payout processing'
    }
};

/**
 * Calculate vendor payout for a booking
 * @param {Number} totalBookingAmount - Total booking amount
 * @returns {Object} Payout breakdown
 */
const calculateVendorPayout = (totalBookingAmount) => {
    const commissionRate = PAYOUT_POLICY.COMMISSION.PLATFORM_COMMISSION_RATE;
    const advancePercentage = PAYOUT_POLICY.PAYMENT_SPLIT.ADVANCE_PAYMENT_PERCENTAGE;
    const balancePercentage = PAYOUT_POLICY.PAYMENT_SPLIT.BALANCE_PAYMENT_PERCENTAGE;

    const platformCommission = (totalBookingAmount * commissionRate) / 100;
    const advancePayment = (totalBookingAmount * advancePercentage) / 100;
    const balancePayment = (totalBookingAmount * balancePercentage) / 100;

    const vendorAdvancePayout = advancePayment - platformCommission;
    const vendorBalanceCollection = balancePayment; // Collected directly, no deduction

    return {
        totalBookingAmount,
        platformCommission,
        advancePayment,
        balancePayment,
        vendorAdvancePayout,
        vendorBalanceCollection,
        totalVendorEarning: vendorAdvancePayout + vendorBalanceCollection
    };
};

/**
 * Get payout policy text for display
 * @returns {String} Formatted policy text
 */
const getPayoutPolicyText = () => {
    return `
# Vendor Payout Policy

## Payment Structure

**Platform Commission:** ${PAYOUT_POLICY.COMMISSION.PLATFORM_COMMISSION_RATE}% on total booking value
- Covers platform operations, marketing, payment processing, and customer support

**Payment Split:**
- **Advance:** ${PAYOUT_POLICY.PAYMENT_SPLIT.ADVANCE_PAYMENT_PERCENTAGE}% paid by guest during booking
- **Balance:** ${PAYOUT_POLICY.PAYMENT_SPLIT.BALANCE_PAYMENT_PERCENTAGE}% collected by vendor at check-in

## How You Get Paid

### Advance Payout (${PAYOUT_POLICY.PAYMENT_SPLIT.ADVANCE_PAYMENT_PERCENTAGE}% of booking)
- **When:** 3 days before guest check-in
- **Amount:** Advance payment minus ${PAYOUT_POLICY.COMMISSION.PLATFORM_COMMISSION_RATE}% platform commission
- **Timeline:** Processed automatically 3 days before check-in
- **Method:** ${PAYOUT_POLICY.PAYOUT_SCHEDULE.ADVANCE_PAYOUT.METHOD}
- **Why this timing:** Aligns with cancellation policy for fair protection

### Balance Collection (${PAYOUT_POLICY.PAYMENT_SPLIT.BALANCE_PAYMENT_PERCENTAGE}% of booking)
- **When:** At guest check-in
- **Amount:** Full ${PAYOUT_POLICY.PAYMENT_SPLIT.BALANCE_PAYMENT_PERCENTAGE}% (no platform deduction)
- **Method:** Cash/UPI collected directly from guest
- **Platform Fee:** None (you keep the full balance)

## Example Calculation

For a booking of ₹10,000:
- Guest pays ₹3,000 (30%) as advance
- Platform commission: ₹500 (5% of ₹10,000)
- Your advance payout: ₹2,500 (₹3,000 - ₹500)
- **Payout timing:** Received 3 days before guest check-in
- Guest pays ₹7,000 (70%) at check-in (you collect directly)
- Your total earning: ₹9,500

## Payout Requirements

✅ Complete KYC verification
✅ Add valid bank account details
✅ Confirm bookings promptly
✅ Maintain accurate property listings

## Cancellation Policy Impact (Aligned with Payout Timing)

### Payout Protection Timeline:
- **Guest cancels >3 days before check-in (>72 hours):**
  - Guest gets: 100% refund
  - You get: ₹0 (payout not yet processed)
  
- **Guest cancels 24-48 hours before check-in:**
  - Guest gets: 50% refund
  - You keep: 50% of advance payout
  
- **Guest cancels <24 hours before check-in:**
  - Guest gets: 30% refund
  - You keep: 70% of advance payout

- **You reject booking:** No payout

## Payment Methods

We support:
- Bank Transfer (Primary)
- UPI Transfer

## Track Your Earnings

View real-time earnings in your dashboard:
- Total revenue
- Pending payouts
- Paid payouts
- Transaction history

---

**Questions?** Contact our vendor support team for assistance.
`;
};

module.exports = {
    PAYOUT_POLICY,
    calculateVendorPayout,
    getPayoutPolicyText
};
