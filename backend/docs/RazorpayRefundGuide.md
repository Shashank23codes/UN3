# Razorpay Refund System - Complete Guide

## Understanding Razorpay Payment States

### Payment Lifecycle:
1. **CREATED** → Order created, no payment yet
2. **AUTHORIZED** → Payment authorized (held), not captured yet
3. **CAPTURED** → Payment settled to merchant
4. **REFUNDED** → Payment returned to customer

## Key Concepts

### AUTHORIZED vs CAPTURED:
- **AUTHORIZED** = Money is held/blocked on customer's card but NOT transferred to you yet
- **CAPTURED** = Money has been transferred to your account
- **VOID** = Release an authorized payment (customer never charged)
- **REFUND** = Return a captured payment (customer was charged, now getting money back)

## Your Current Implementation

### When Booking is Made:
```javascript
{
    amount: amount * 100,
    currency: 'INR',
    payment_capture: 0  // 0 = Manual Capture (Auth only)
}
```
- Payment is **AUTHORIZED** only
- Money is held but not captured
- Shows as "authorized" on Razorpay dashboard

### When Vendor Confirms Booking:
```javascript
await razorpay.payments.capture(paymentId, amount);
```
- Payment changes from authorized → **CAPTURED**
- Money is now transferred to your account
- Shows as "captured" on Razorpay dashboard

## Refund Logic (NOW FIXED)

### Scenario 1: Vendor Rejects Booking (Before Confirmation)
- **Payment Status**: AUTHORIZED
- **Action**: VOID the authorization
- **Razorpay API**: `razorpay.payments.fetch(paymentId).void()`
- **Result**: Authorization released, customer never charged
- **Dashboard**: Shows as "voided" or "failed"

### Scenario 2: User Cancels >3 Days Before (100% Refund)
- **Payment Status**: AUTHORIZED
- **Action**: VOID the authorization
- **Razorpay API**: `razorpay.payments.fetch(paymentId).void()`
- **Result**: Full amount released to customer
- **Dashboard**: Shows as "voided"

### Scenario 3: User Cancels 24-48h Before (50% Refund)
- **Payment Status**: Could be AUTHORIZED or CAPTURED
- **Action**: REFUND (can't void partial)
- **Razorpay API**: 
  ```javascript
  razorpay.payments.refund(paymentId, {
      amount: refundAmountInPaise,
      speed: 'normal'
  })
  ```
- **Result**: 50% returned to customer
- **Dashboard**: Shows in "Refunds" section
- **Timeline**: 5-7 business days

### Scenario 4: User Cancels <24h Before (30% Refund)
- **Payment Status**: Could be AUTHORIZED or CAPTURED
- **Action**: REFUND
- **Result**: 30% returned to customer, vendor keeps 70%
- **Dashboard**: Shows in "Refunds" section
- **Timeline**: 5-7 business days

## How to Verify Refunds on Razorpay

### For VOIDED Payments:
1. Go to Razorpay Dashboard → Payments
2. Search for payment ID
3. Status will show "failed" or "voided"
4. No refund entry (because it was never captured)

### For REFUNDED Payments:
1. Go to Razorpay Dashboard → Refunds
2. You'll see all refund transactions
3. Each refund shows:
   - Refund ID
   - Original Payment ID
   - Refund Amount
   - Status (Processed/Pending)
   - Created Date
   - Settlement Date

### Refund Status Meanings:
- **Processed**: Refund initiated successfully
- **Pending**: In progress (usually 5-7 business days)
- **Failed**: Refund failed, needs manual intervention

## Testing Refunds

### Test Mode (Using Test API Keys):
```
Test Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

1. Create a booking (payment becomes AUTHORIZED)
2. Cancel it
3. Check Razorpay Test Dashboard → Refunds
4. You'll see the refund transaction

### Live Mode:
- Refunds appear in Razorpay Dashboard → Refunds
- Settled refunds show in your settlement reports
- Customer receives money in 5-7 business days

## Code Flow

### Vendor Rejection Flow:
```javascript
1. Fetch payment status
2. If AUTHORIZED → void()
3. If CAPTURED → refund(fullAmount)
4. Update booking status to 'cancelled'
5. Update vendorPayout.status to 'cancelled'
6. Send notification to user
```

### User Cancellation Flow:
```javascript
1. Calculate refund amount based on timing
2. Fetch payment status
3. If AUTHORIZED + 100% refund → void()
4. If CAPTURED or partial refund → refund(amount)
5. Calculate vendor payout percentage
6. Update vendorPayout.amount and status
7. Send notifications
```

## What Admin Sees

### In Database (Booking Model):
```javascript
{
    refundId: "rfnd_xxxxx",           // Razorpay refund ID
    refundStatus: "processed",         // Status of refund
    refundAmount: 1500,                // Amount refunded to user
    refundInitiatedAt: Date,           // When refund was triggered
    vendorPayout: {
        amount: 750,                   // Amount vendor gets
        status: "pending",             // Admin needs to pay this
        cancellationPercentage: 50     // Vendor gets 50%
    }
}
```

### What This Means:
- User gets ₹1,500 refund (automatically processed)
- Vendor gets ₹750 payout (admin pays manually)
- Admin keeps the difference

## Troubleshooting

### "Refund not showing on Razorpay Dashboard"
- **Cause**: Trying to refund AUTHORIZED payment
- **Solution**: Use void() instead for authorized payments
- **Fixed**: ✅ Now checks payment status first

### "BAD_REQUEST_ERROR: The payment has not been captured yet"
- **Cause**: Attempting refund on authorized payment
- **Solution**: Use void() for authorized, refund() for captured
- **Fixed**: ✅ Implemented in latest code

### "Partial refund not working"
- **Cause**: Can't partially void authorized payments
- **Solution**: Must use refund() API even on authorized payments for partial refunds
- **Fixed**: ✅ Code now handles this correctly

## Important Notes

1. **Void vs Refund Timeline**:
   - Void: Immediate (customer never charged)
   - Refund: 5-7 business days

2. **Razorpay Fees**:
   - Void: No fees (transaction never completed)
   - Refund: You MAY be charged processing fees (check Razorpay pricing)

3. **Settlement Impact**:
   - Voided payments don't affect settlements
   - Refunded payments are deducted from your settlements

4. **Customer sees**:
   - Void: Authorization hold released
   - Refund: Amount credited to original payment method

## API Endpoints

### Create Void:
```javascript
await razorpay.payments.fetch(paymentId).void();
```

### Create Refund:
```javascript
await razorpay.payments.refund(paymentId, {
    amount: amountInPaise,  // Optional: full refund if not provided
    speed: 'normal',        // 'normal' or 'optimum'
    notes: {
        reason: 'User cancellation',
        bookingId: 'xxx'
    }
});
```

### Fetch Payment:
```javascript
const payment = await razorpay.payments.fetch(paymentId);
console.log(payment.status); // 'authorized', 'captured', etc.
```

## Summary

✅ **Vendor Rejection**: Auto-void if authorized, auto-refund if captured
✅ **User Cancellation**: Auto-void for 100% refunds on authorized, auto-refund for all others
✅ **Vendor Payout**: Calculated based on cancellation timing (0%, 50%, or 70%)
✅ **Refund Tracking**: Stored in booking with refundId and status
✅ **Razorpay Dashboard**: Shows voids as failed payments, refunds in Refunds section

Now refunds will automatically process and appear correctly on your Razorpay dashboard!
