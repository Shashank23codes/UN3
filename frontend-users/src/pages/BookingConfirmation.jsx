import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Calendar, Users, MapPin, Key, CreditCard, Clock } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const BookingConfirmation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const receiptNumber = searchParams.get('receipt');
    const { bookingConfirmed, paymentSuccess } = useNotification();

    useEffect(() => {
        if (receiptNumber) {
            fetchReceipt();
        } else {
            setLoading(false);
        }
    }, [receiptNumber]);

    const fetchReceipt = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/bookings/receipt/${receiptNumber}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBooking(res.data.receipt);

            // Send browser notifications for successful bookings
            const bookingData = res.data.receipt;
            if (bookingData.status === 'confirmed') {
                // Send booking confirmation notification
                bookingConfirmed({
                    id: bookingData._id,
                    farmhouseName: bookingData.farmhouse.name,
                    checkIn: new Date(bookingData.dates.checkIn).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                    }),
                });

                // Send payment success notification
                paymentSuccess(bookingData.payment.advancePayment);
            }
        } catch (error) {
            console.error('Error fetching receipt:', error);
        } finally {
            setLoading(false);
        }
    };

    const receiptRef = useRef(null);

    const handlePrint = () => {
        if (!booking || !receiptRef.current) return;

        // Build a filename: Receipt_RCP123456_20Feb2026_1530.pdf
        const now = new Date();
        const datePart = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\s/g, '');
        const timePart = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '');
        const fileName = `Receipt_${booking.receiptNumber}_${datePart}_${timePart}`;

        // Clone the receipt HTML
        const receiptHTML = receiptRef.current.innerHTML;

        // Open a clean print window
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            alert('Please allow popups to download the receipt.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fileName}</title>
                <meta charset="UTF-8" />
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; }
                    @page { size: A4; margin: 10mm; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    /* Gradient header */
                    .receipt-header { background: linear-gradient(to right, #059669, #0d9488); color: white; padding: 24px 32px; }
                    .receipt-header h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
                    .receipt-header p { color: rgba(255,255,255,0.8); font-size: 14px; }
                    .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
                    .text-right { text-align: right; }
                    .text-sm { font-size: 13px; }
                    .font-bold { font-weight: 700; }
                    .text-lg { font-size: 17px; }
                    /* Sections */
                    .section { padding: 24px 32px; border-bottom: 1px solid #e5e7eb; }
                    .section:last-child { border-bottom: none; }
                    .section h4 { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 16px; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                    .flex-row { display: flex; align-items: center; gap: 10px; }
                    .label { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
                    .value { font-size: 14px; font-weight: 600; color: #111827; }
                    .property-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; }
                    .property-name { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 6px; }
                    .location { font-size: 13px; color: #6b7280; }
                    /* Payment */
                    .payment-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #4b5563; }
                    .payment-total { display: flex; justify-content: space-between; padding: 12px 0 6px; font-size: 15px; font-weight: 700; color: #111827; border-top: 1px solid #e5e7eb; margin-top: 8px; }
                    .emerald { color: #059669; }
                    /* Check-in code */
                    .checkin-box { background: #ecfdf5; padding: 20px 32px; border-bottom: 1px solid #d1fae5; }
                    .checkin-code { font-size: 26px; font-weight: 700; color: #065f46; letter-spacing: 4px; margin-top: 6px; }
                    .checkin-label { font-size: 13px; color: #047857; font-weight: 500; }
                    .checkin-note { font-size: 12px; color: #047857; margin-top: 8px; }
                    /* Host */
                    .host-section { background: #f9fafb; padding: 20px 32px; }
                    .host-section h4 { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 10px; }
                    .host-row { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
                    .host-row span { font-weight: 600; color: #374151; }
                    /* Cancelled */
                    .cancel-box { background: #fef2f2; padding: 20px 32px; border-bottom: 1px solid #fecaca; }
                    .cancel-box h4 { font-size: 14px; font-weight: 700; color: #7f1d1d; margin-bottom: 10px; }
                    .cancel-row { font-size: 13px; color: #991b1b; margin-bottom: 4px; }
                    /* Footer watermark */
                    .print-footer { text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; margin-top: 8px; }
                </style>
            </head>
            <body>
                <div style="max-width:750px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <div class="receipt-header">
                        <div class="header-row">
                            <div>
                                <h2>UtsavNest</h2>
                                <p>Booking Receipt</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm" style="color:rgba(255,255,255,0.7)">Receipt #</p>
                                <p class="text-lg font-bold">${booking.receiptNumber}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Property Details -->
                    <div class="section">
                        <div class="flex-row">
                            ${booking.farmhouse.image ? `<img src="${booking.farmhouse.image}" class="property-img" alt="property" />` : ''}
                            <div>
                                <p class="property-name">${booking.farmhouse.name}</p>
                                <p class="location">${booking.farmhouse.location.city}, ${booking.farmhouse.location.state}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Booking Details -->
                    <div class="section">
                        <h4>Booking Details</h4>
                        <div class="grid-2">
                            <div>
                                <p class="label">Check-in</p>
                                <p class="value">${new Date(booking.dates.checkIn).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p class="label">Check-out</p>
                                <p class="value">${new Date(booking.dates.checkOut).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p class="label">Guests</p>
                                <p class="value">${booking.guests} Guests</p>
                            </div>
                            <div>
                                <p class="label">Status</p>
                                <p class="value" style="text-transform:capitalize">${booking.status.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Check-in Code -->
                    ${!isCancelled && booking.checkInCode ? `
                    <div class="checkin-box">
                        <p class="checkin-label">Your Check-in Code</p>
                        <p class="checkin-code">${booking.checkInCode}</p>
                        <p class="checkin-note">Present this code to the host during check-in</p>
                    </div>` : ''}

                    <!-- Payment Summary -->
                    <div class="section">
                        <h4>Payment Summary</h4>
                        <div class="payment-row"><span>Total Amount</span><span>₹${booking.payment.totalPrice.toLocaleString()}</span></div>
                        <div class="payment-row"><span>Advance Paid (30%)</span><span class="emerald">₹${booking.payment.advancePayment.toLocaleString()}</span></div>
                        ${!isCancelled ? `<div class="payment-total"><span>Balance Due at Property</span><span>₹${booking.payment.balancePayment.toLocaleString()}</span></div>` : ''}
                    </div>

                    <!-- Cancellation Details -->
                    ${isCancelled && booking.cancellation ? `
                    <div class="cancel-box">
                        <h4>Cancellation Details</h4>
                        <p class="cancel-row"><span>Cancelled by:</span> ${booking.cancellation.cancelledBy}</p>
                        <p class="cancel-row"><span>Date:</span> ${new Date(booking.cancellation.cancelledAt).toLocaleString()}</p>
                        ${booking.cancellation.reason ? `<p class="cancel-row"><span>Reason:</span> ${booking.cancellation.reason}</p>` : ''}
                        <p class="cancel-row"><span>Refund Amount:</span> ₹${booking.cancellation.refundAmount.toLocaleString()}</p>
                    </div>` : ''}

                    <!-- Host Contact -->
                    <div class="host-section">
                        <h4>Host Contact</h4>
                        <p class="host-row"><span>Name:</span> ${booking.vendor.name}</p>
                        <p class="host-row"><span>Email:</span> ${booking.vendor.email}</p>
                        <p class="host-row"><span>Phone:</span> ${booking.vendor.phone}</p>
                    </div>

                    <div class="print-footer">Generated by UtsavNest · ${now.toLocaleString('en-IN')} · ${fileName}</div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        // Wait for images/styles to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 600);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Receipt Not Found</h2>
                    <button
                        onClick={() => navigate('/trips')}
                        className="btn-primary"
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    const isCancelled = booking.status === 'cancelled';

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-24 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8 print:hidden">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isCancelled ? 'bg-red-100' : 'bg-emerald-100'} mb-4`}>
                        <CheckCircle className={`h-10 w-10 ${isCancelled ? 'text-red-600' : 'text-emerald-600'}`} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isCancelled ? 'Booking Cancelled' : booking.status === 'pending_confirmation' ? 'Booking Requested!' : 'Booking Confirmed!'}
                    </h1>
                    <p className="text-gray-600">
                        {isCancelled
                            ? 'Your booking has been cancelled and refund processed'
                            : booking.status === 'pending_confirmation'
                                ? 'Waiting for host confirmation'
                                : 'Your reservation is confirmed'}
                    </p>
                </div>

                {/* Receipt Card */}
                {booking.status === 'pending_confirmation' ? (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
                        <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="h-10 w-10 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Waiting for Host Confirmation</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Your booking request has been sent to the host. You will receive a notification and the full receipt once the host confirms your booking.
                        </p>
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-lg mx-auto">
                            <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Property</span>
                                    <span className="font-semibold text-gray-900">{booking.farmhouse.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Check-in</span>
                                    <span className="font-semibold text-gray-900">{new Date(booking.dates.checkIn).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Check-out</span>
                                    <span className="font-semibold text-gray-900">{new Date(booking.dates.checkOut).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Amount Paid</span>
                                    <span className="font-semibold text-emerald-600">₹{booking.payment.advancePayment.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/trips')}
                            className="btn-primary w-full sm:w-auto"
                        >
                            Go to My Trips
                        </button>
                    </div>
                ) : (
                    <div ref={receiptRef} className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none">
                        {/* Receipt Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">UtsavNest</h2>
                                    <p className="text-emerald-100">Booking Receipt</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-emerald-100">Receipt #</p>
                                    <p className="text-lg font-bold">{booking.receiptNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex items-start space-x-4">
                                {booking.farmhouse.image && (
                                    <img
                                        src={booking.farmhouse.image}
                                        alt={booking.farmhouse.name}
                                        className="w-24 h-24 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {booking.farmhouse.name}
                                    </h3>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span className="text-sm">
                                            {booking.farmhouse.location.city}, {booking.farmhouse.location.state}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="p-8 border-b border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-4">Booking Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Check-in</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(booking.dates.checkIn).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Check-out</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(booking.dates.checkOut).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Guests</p>
                                        <p className="font-semibold text-gray-900">{booking.guests} Guests</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <CreditCard className="h-5 w-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {booking.status.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Check-in Code (if confirmed) */}
                        {!isCancelled && booking.checkInCode && (
                            <div className="p-8 bg-emerald-50 border-b border-emerald-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Key className="h-6 w-6 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-emerald-700 font-medium">Your Check-in Code</p>
                                            <p className="text-2xl font-bold text-emerald-900 tracking-wider">
                                                {booking.checkInCode}
                                            </p>
                                        </div>
                                    </div>
                                    {booking.checkInVerified && (
                                        <div className="text-right">
                                            <p className="text-sm text-emerald-700">Checked In</p>
                                            <p className="text-xs text-emerald-600">
                                                {new Date(booking.checkInVerifiedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-emerald-700 mt-3">
                                    Present this code to the host during check-in
                                </p>
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="p-8 border-b border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-4">Payment Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Amount</span>
                                    <span className="font-semibold">₹{booking.payment.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Advance Paid (30%)</span>
                                    <span className="font-semibold text-emerald-600">
                                        ₹{booking.payment.advancePayment.toLocaleString()}
                                    </span>
                                </div>
                                {!isCancelled && (
                                    <div className="flex justify-between text-gray-900 pt-3 border-t border-gray-200">
                                        <span className="font-bold">Balance Due at Property</span>
                                        <span className="font-bold text-lg">
                                            ₹{booking.payment.balancePayment.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {booking.payment.balancePaidAt && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Balance Paid</span>
                                        <span className="font-semibold">
                                            {new Date(booking.payment.balancePaidAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cancellation Details */}
                        {isCancelled && booking.cancellation && (
                            <div className="p-8 bg-red-50 border-b border-red-100">
                                <h4 className="font-bold text-red-900 mb-3">Cancellation Details</h4>
                                <div className="space-y-2 text-sm">
                                    <p className="text-red-700">
                                        <span className="font-semibold">Cancelled by:</span> {booking.cancellation.cancelledBy}
                                    </p>
                                    <p className="text-red-700">
                                        <span className="font-semibold">Date:</span>{' '}
                                        {new Date(booking.cancellation.cancelledAt).toLocaleString()}
                                    </p>
                                    {booking.cancellation.reason && (
                                        <p className="text-red-700">
                                            <span className="font-semibold">Reason:</span> {booking.cancellation.reason}
                                        </p>
                                    )}
                                    <p className="text-red-700 font-semibold">
                                        Refund Amount: ₹{booking.cancellation.refundAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Host Contact */}
                        <div className="p-8 bg-gray-50">
                            <h4 className="font-bold text-gray-900 mb-3">Host Contact</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p><span className="font-semibold">Name:</span> {booking.vendor.name}</p>
                                <p><span className="font-semibold">Email:</span> {booking.vendor.email}</p>
                                <p><span className="font-semibold">Phone:</span> {booking.vendor.phone}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-8 flex flex-col sm:flex-row gap-4 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="flex-1 btn-secondary flex items-center justify-center"
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Download Receipt
                            </button>
                            <button
                                onClick={() => navigate('/trips')}
                                className="flex-1 btn-primary"
                            >
                                View All Bookings
                            </button>
                        </div>
                    </div>
                )}

                {/* Important Note */}
                {!isCancelled && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Important:</span> Please save your check-in code and present it to the host upon arrival. The remaining balance of ₹{booking.payment.balancePayment.toLocaleString()} must be paid directly to the host at the property.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingConfirmation;
