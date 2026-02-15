import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Calendar, MapPin, IndianRupee, Star, MessageSquare, CheckCircle, Key, FileText, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReviewModal from '../components/ReviewModal';

const Trips = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [cancellingBookingId, setCancellingBookingId] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/my-bookings`, config);
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load your trips');
        } finally {
            setLoading(false);
        }
    };

    const isCompletedBooking = (booking) => {
        const checkoutDate = new Date(booking.checkOut);
        const today = new Date();
        // Allow reviews for:
        // 1. Bookings with status 'completed'
        // 2. Bookings with status 'confirmed' or 'checked_in' that have passed checkout date
        return booking.status === 'completed' ||
            ((booking.status === 'confirmed' || booking.status === 'checked_in') && checkoutDate < today);
    };

    const handleWriteReview = (booking) => {
        setSelectedBooking(booking);
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmitted = () => {
        setIsReviewModalOpen(false);
        setSelectedBooking(null);
        fetchBookings(); // Refresh bookings
        toast.success('Review submitted successfully!');
    };

    const canCancelBooking = (booking) => {
        if (!booking) return false;
        if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'checked_in') return false;

        const checkInDate = new Date(booking.checkIn);
        const now = new Date();
        return now < checkInDate;
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;

        setCancellingBookingId(bookingToCancel._id);
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/cancel/${bookingToCancel._id}`,
                { reason: 'Cancelled by user from trips page' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.refund) {
                toast.success(
                    `Booking cancelled! Refund of ₹${response.data.refund.amount} will be processed within ${response.data.refund.timeline}.`,
                    { autoClose: 5000 }
                );
            } else {
                toast.success('Booking cancelled successfully');
            }

            setShowCancelModal(false);
            setBookingToCancel(null);
            fetchBookings(); // Refresh bookings
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingBookingId(null);
        }
    };

    const getRefundPercentage = (booking) => {
        if (!booking) return 0;
        const checkInDate = new Date(booking.checkIn);
        const now = new Date();
        const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

        if (hoursUntilCheckIn >= 48) return 100;
        if (hoursUntilCheckIn >= 24) return 30; // Updated from 50 to 30
        return 0;
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-20">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-rose-600 mb-4" />
                    <p className="text-gray-500 font-medium">Loading your trips...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
                    <p className="text-gray-600">Manage and review your farmhouse bookings</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No trips booked... yet!</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Time to dust off your bags and start planning your next adventure.
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Start searching
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {bookings.map((booking) => {
                            const isCompleted = isCompletedBooking(booking);

                            return (
                                <div
                                    key={booking._id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                                >
                                    {/* Image Container */}
                                    <div className="relative h-56">
                                        <img
                                            src={booking.farmhouse?.images[0] || 'https://via.placeholder.com/400'}
                                            alt={booking.farmhouse?.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                                        {/* Status Badge - Show completed status or booking status */}
                                        {booking.status === 'completed' || booking.status === 'checked_in' ? (
                                            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                <CheckCircle className="h-3 w-3" />
                                                {booking.status === 'checked_in' ? 'Checked In' : 'Completed'}
                                            </div>
                                        ) : (
                                            <div className={`absolute top-4 right-4 ${getStatusBadgeColor(booking.status)} px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-lg`}>
                                                {booking.status}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <Link
                                            to={`/farmhouses/${booking.farmhouse?._id}`}
                                            className="block hover:text-rose-600 transition-colors"
                                        >
                                            <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">
                                                {booking.farmhouse?.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center text-gray-500 text-sm mb-5">
                                            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                            <span className="truncate">
                                                {booking.farmhouse?.location?.city}, {booking.farmhouse?.location?.state}
                                            </span>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="space-y-3 border-t border-gray-100 pt-4 mb-5">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    <span>Check-in</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    <span>Check-out</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                <div className="flex items-center text-gray-600 text-sm">
                                                    <IndianRupee className="h-4 w-4 mr-2" />
                                                    <span>Total Price</span>
                                                </div>
                                                <span className="font-bold text-gray-900 text-xl">
                                                    ₹{booking.totalPrice?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Check-in Code (if confirmed) */}
                                        {(booking.status === 'confirmed' || booking.status === 'checked_in') && booking.checkInCode && (
                                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center text-emerald-700">
                                                        <Key className="h-4 w-4 mr-2" />
                                                        <span className="text-xs font-medium">Check-in Code</span>
                                                    </div>
                                                    <span className="font-bold text-emerald-900 tracking-wider">
                                                        {booking.checkInCode}
                                                    </span>
                                                </div>
                                                {booking.checkInVerified && (
                                                    <p className="text-xs text-emerald-600 mt-1">
                                                        ✓ Checked in on {new Date(booking.checkInVerifiedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Payment Status */}
                                        {booking.paymentStatus && (
                                            <div className="mb-4 text-sm">
                                                <span className="text-gray-600">Payment: </span>
                                                <span className={`font-semibold ${booking.paymentStatus === 'fully_paid' ? 'text-green-600' :
                                                    booking.paymentStatus === 'partially_paid' ? 'text-yellow-600' :
                                                        'text-gray-600'
                                                    }`}>
                                                    {booking.paymentStatus.replace('_', ' ').toUpperCase()}
                                                </span>
                                                {booking.balancePayment && booking.paymentStatus !== 'fully_paid' && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Balance due: ₹{booking.balancePayment.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}


                                        {/* Refund Information for Cancelled Bookings */}
                                        {booking.status === 'cancelled' && booking.refundAmount > 0 && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-blue-900">Refund</span>
                                                    <span className="font-bold text-blue-900">
                                                        ₹{booking.refundAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-blue-700">
                                                    {booking.refundStatus === 'processed' ? '✓ Processed' : 'Processing in 5-7 days'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            {/* View Receipt Button */}
                                            {booking.receiptNumber && (
                                                <Link
                                                    to={`/booking-confirmation?receipt=${booking.receiptNumber}`}
                                                    className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    View Receipt
                                                </Link>
                                            )}

                                            {/* Write Review Button */}
                                            {isCompleted && (
                                                <button
                                                    onClick={() => handleWriteReview(booking)}
                                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-2.5 rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                                >
                                                    <Star className="h-4 w-4" />
                                                    Write a Review
                                                </button>
                                            )}

                                            {/* Cancel Button */}
                                            {canCancelBooking(booking) && (
                                                <button
                                                    onClick={() => {
                                                        setBookingToCancel(booking);
                                                        setShowCancelModal(true);
                                                    }}
                                                    disabled={cancellingBookingId === booking._id}
                                                    className="w-full bg-white border-2 border-red-200 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedBooking && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    bookingId={selectedBooking._id}
                    farmhouseId={selectedBooking.farmhouse?._id}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && bookingToCancel && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                            <p className="text-gray-600 mb-2 font-medium">{bookingToCancel.farmhouse?.name}</p>
                            <p className="text-sm text-gray-500 mb-4">
                                {new Date(bookingToCancel.checkIn).toLocaleDateString()} - {new Date(bookingToCancel.checkOut).toLocaleDateString()}
                            </p>

                            {/* Refund Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-900">Refund Amount</span>
                                    <span className="text-xl font-bold text-blue-900">
                                        ₹{Math.round((bookingToCancel.advancePayment || bookingToCancel.totalPrice * 0.3) * getRefundPercentage(bookingToCancel) / 100).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <p>• {getRefundPercentage(bookingToCancel)}% of advance payment</p>
                                    <p>• Processed within 5-7 business days</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setBookingToCancel(null);
                                }}
                                disabled={cancellingBookingId}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                disabled={cancellingBookingId}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {cancellingBookingId ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        Cancelling...
                                    </>
                                ) : (
                                    'Yes, Cancel'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trips;
