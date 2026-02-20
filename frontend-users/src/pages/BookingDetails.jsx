import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Users, Phone, Mail, Download,
    XCircle, CheckCircle, Clock, AlertCircle, Home,
    CreditCard, FileText, MessageSquare, Star, Info, TrendingDown
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [refundInfo, setRefundInfo] = useState(null);

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/bookings/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBooking(response.data);
        } catch (error) {
            toast.error('Failed to load booking details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (reason = '') => {
        setCancelling(true);
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/cancel/${id}`,
                { reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Display refund information
            if (response.data.refund) {
                toast.success(
                    `Booking cancelled! Refund of ₹${response.data.refund.amount} will be processed within ${response.data.refund.timeline}.`,
                    { autoClose: 5000 }
                );
                setRefundInfo(response.data.refund);
            } else {
                toast.success('Booking cancelled successfully');
            }

            setShowCancelModal(false);
            fetchBookingDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    const handleDownloadReceipt = () => {
        if (booking?.receiptNumber) {
            navigate(`/booking-confirmation?receipt=${booking.receiptNumber}`);
        } else {
            toast.error('Receipt not available');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending_confirmation':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-5 w-5" />;
            case 'pending_confirmation':
                return <Clock className="h-5 w-5" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5" />;
            case 'completed':
                return <CheckCircle className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    const canCancelBooking = () => {
        if (!booking) return false;

        // Cannot cancel if already cancelled, completed, or checked in
        if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'checked_in') return false;

        const checkInDate = new Date(booking.checkIn);
        const now = new Date();

        // Can cancel if check-in hasn't happened yet
        // This includes 'pending_confirmation' and 'confirmed' statuses
        const canCancel = now < checkInDate;

        console.log('Can cancel booking:', {
            status: booking.status,
            checkInDate,
            now,
            canCancel
        });

        return canCancel;
    };

    const getRefundPercentage = () => {
        if (!booking) return 0;
        const checkInDate = new Date(booking.checkIn);
        const now = new Date();
        const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

        if (hoursUntilCheckIn >= 48) return 100;
        if (hoursUntilCheckIn >= 24) return 50;
        return 0;
    };

    const canReviewBooking = () => {
        if (!booking) return false;
        // Allow review if status is completed OR (confirmed and checkout date passed)
        // This handles cases where status update might be delayed but user has physically checked out
        const isCompleted = booking.status === 'completed';
        const isPastCheckout = new Date() > new Date(booking.checkOut);

        return (isCompleted || (booking.status === 'confirmed' && isPastCheckout));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                    <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/trips')}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
                    >
                        View All Bookings
                    </button>
                </div>
            </div>
        );
    }

    const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {booking && (
                <SEO
                    title={`Booking #${booking.bookingId || booking._id}`}
                    description={`Booking details for your stay at ${booking.farmhouse?.name}`}
                />
            )}
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/trips')}
                        className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 flex items-center gap-2"
                    >
                        ← Back to Trips
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                            <p className="text-gray-600 mt-1">Booking ID: {booking.bookingId || booking._id}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="font-semibold capitalize">{booking.status.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Farmhouse Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {booking.farmhouse?.images?.[0] && (
                                <img
                                    src={booking.farmhouse.images[0]}
                                    alt={booking.farmhouse.name}
                                    className="w-full h-64 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {booking.farmhouse?.name}
                                        </h2>
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {booking.farmhouse?.location?.city}, {booking.farmhouse?.location?.state}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/farmhouses/${booking.farmhouse._id}`)}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                                    >
                                        <Home className="h-4 w-4" />
                                        View Property
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Booking Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500 mb-1 block">Check-in</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Calendar className="h-5 w-5 text-emerald-600" />
                                            <span className="font-medium">
                                                {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 ml-7">After 2:00 PM</p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 mb-1 block">Number of Guests</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Users className="h-5 w-5 text-emerald-600" />
                                            <span className="font-medium">{booking.numberOfGuests} Guests</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500 mb-1 block">Check-out</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Calendar className="h-5 w-5 text-emerald-600" />
                                            <span className="font-medium">
                                                {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 ml-7">Before 11:00 AM</p>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500 mb-1 block">Duration</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Clock className="h-5 w-5 text-emerald-600" />
                                            <span className="font-medium">{nights} Night{nights > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {booking.guestDetails?.specialRequests && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <label className="text-sm text-gray-500 mb-2 block">Special Requests</label>
                                    <p className="text-gray-900">{booking.guestDetails.specialRequests}</p>
                                </div>
                            )}
                        </div>

                        {/* Guest Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <Users className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{booking.guestDetails?.name || booking.user?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <Mail className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{booking.guestDetails?.email || booking.user?.email}</p>
                                    </div>
                                </div>

                                {booking.guestDetails?.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 p-2 rounded-lg">
                                            <Phone className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{booking.guestDetails.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Price Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Price Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">₹{(booking.totalPrice / nights).toLocaleString()} × {nights} nights</span>
                                    <span className="text-gray-900">₹{booking.totalPrice?.toLocaleString()}</span>
                                </div>

                                {booking.platformFee && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Service fee</span>
                                        <span className="text-gray-900">₹{booking.platformFee?.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total Paid</span>
                                        <span className="text-2xl font-bold text-emerald-600">
                                            ₹{booking.totalPrice?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {booking.payment?.status === 'completed' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                                        <div className="flex items-center gap-2 text-green-800 text-sm">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">Payment Confirmed</span>
                                        </div>
                                        <p className="text-xs text-green-700 mt-1">
                                            {new Date(booking.payment.paidAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleDownloadReceipt}
                                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="h-5 w-5" />
                                    Download Receipt
                                </button>

                                {canReviewBooking() && (
                                    <button
                                        onClick={() => navigate(`/reviews/write/${booking._id}`)}
                                        className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Star className="h-5 w-5 fill-white" />
                                        Write a Review
                                    </button>
                                )}

                                {canCancelBooking() && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full bg-white border-2 border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="h-5 w-5" />
                                        Cancel Booking
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate(`/farmhouses/${booking.farmhouse._id}`)}
                                    className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    Contact Host
                                </button>
                            </div>
                        </div>

                        {/* Cancellation Info for Cancelled Bookings */}
                        {booking.status === 'cancelled' && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                                    <XCircle className="h-5 w-5" />
                                    Booking Cancelled
                                </h4>
                                <div className="space-y-2 text-sm text-red-800">
                                    <p>
                                        <span className="font-medium">Cancelled on:</span>{' '}
                                        {new Date(booking.cancelledAt).toLocaleDateString('en-IN')}
                                    </p>
                                    {booking.refundAmount > 0 && (
                                        <>
                                            <p>
                                                <span className="font-medium">Refund amount:</span>{' '}
                                                ₹{booking.refundAmount.toLocaleString()}
                                            </p>
                                            <p>
                                                <span className="font-medium">Refund status:</span>{' '}
                                                <span className="capitalize">{booking.refundStatus}</span>
                                            </p>
                                            <p className="text-xs text-red-700 mt-2">
                                                Refunds are processed within 5-7 business days
                                            </p>
                                        </>
                                    )}
                                    {booking.cancellationReason && (
                                        <p className="mt-2 pt-2 border-t border-red-200">
                                            <span className="font-medium">Reason:</span> {booking.cancellationReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cancellation Policy */}
                        {booking.status !== 'cancelled' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Cancellation Policy
                                </h4>
                                <div className="space-y-2 text-sm text-amber-800">
                                    <p>• Cancel 48+ hours before check-in: <span className="font-semibold">100% refund</span></p>
                                    <p>• Cancel 24-48 hours before: <span className="font-semibold">50% refund</span></p>
                                    <p>• Cancel less than 24 hours: <span className="font-semibold">No refund</span></p>
                                    <p className="text-xs text-amber-700 mt-3 pt-3 border-t border-amber-200">
                                        All refunds are processed within 5-7 business days
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to cancel this booking?
                            </p>

                            {/* Refund Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-900">Refund Amount</span>
                                    <span className="text-xl font-bold text-blue-900">
                                        ₹{Math.round((booking.advancePayment || booking.totalPrice * 0.3) * getRefundPercentage() / 100).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <p>• {getRefundPercentage()}% of advance payment</p>
                                    <p>• Processed within 5-7 business days</p>
                                </div>
                            </div>

                            {/* Policy Info */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-amber-800 font-medium mb-1 flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    Cancellation Policy
                                </p>
                                <div className="text-xs text-amber-700 space-y-0.5 text-left">
                                    <p>• 48+ hours: 100% refund</p>
                                    <p>• 24-48 hours: 50% refund</p>
                                    <p>• {'<'}24 hours: No refund</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                disabled={cancelling}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
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

export default BookingDetails;
