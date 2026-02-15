import React, { useEffect, useState } from 'react';
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

    const handlePrint = () => {
        window.print();
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
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
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none">
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
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
