import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Users, Phone, Mail, MapPin,
    CheckCircle, XCircle, Clock, IndianRupee, Home,
    User, MessageSquare, AlertCircle, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal States
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'default',
        showInput: false,
        onConfirm: () => { },
        inputValue: ''
    });

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            console.log('Fetching booking details for ID:', id);
            console.log('Using token:', token ? 'Token exists' : 'No token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/bookings/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Booking data received:', response.data);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to fetch booking details');
            // Don't navigate away immediately - let the user see the error
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptBooking = () => {
        setModalConfig({
            isOpen: true,
            title: 'Accept Booking',
            message: 'Are you sure you want to accept this booking request?',
            confirmText: 'Accept',
            type: 'default',
            showInput: false,
            onConfirm: performAccept
        });
    };

    const performAccept = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('vendorToken');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/capture/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Booking accepted successfully!');
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            fetchBookingDetails();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to accept booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectBooking = () => {
        setModalConfig({
            isOpen: true,
            title: 'Reject Booking',
            message: 'Please provide a reason for rejecting this booking.',
            confirmText: 'Reject',
            type: 'danger',
            showInput: true,
            inputValue: '',
            onConfirm: (reason) => performReject(reason)
        });
    };

    const performReject = async (reason) => {
        if (!reason && modalConfig.showInput) {
            toast.error('Reason is required');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('vendorToken');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payments/reject/${id}`,
                { reason: reason || modalConfig.inputValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Booking rejected');
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            fetchBookingDetails();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to reject booking');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending_confirmation: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', label: 'Pending Confirmation', icon: Clock },
            confirmed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', label: 'Confirmed', icon: CheckCircle },
            cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', label: 'Cancelled', icon: XCircle },
            completed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', label: 'Completed', icon: CheckCircle }
        };

        const config = statusConfig[status] || statusConfig.pending_confirmation;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                <Icon className="h-5 w-5" />
                {config.label}
            </span>
        );
    };

    const calculateNights = () => {
        if (!booking) return 0;
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Booking not found</h3>
                    <p className="text-gray-500 mt-1">This booking doesn't exist or you don't have access to it</p>
                    <button
                        onClick={() => navigate('/dashboard/bookings')}
                        className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                    >
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/dashboard/bookings')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Bookings
                </button>

                {/* Title Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-sm border border-emerald-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Booking Details</h1>
                            <p className="text-gray-600 mt-2">Booking ID: <span className="font-mono text-sm">{booking._id.slice(-8)}</span></p>
                        </div>
                        {getStatusBadge(booking.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Property Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Home className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-xl font-bold text-gray-900">Property Information</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Property Name</p>
                                    <p className="font-bold text-gray-900 text-lg">{booking.farmhouse?.name || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Location</p>
                                    <p className="text-gray-900 font-medium">{booking.farmhouse?.location?.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-xl font-bold text-gray-900">Booking Information</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Check-in</p>
                                    <p className="font-bold text-gray-900">
                                        {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Check-out</p>
                                    <p className="font-bold text-gray-900">
                                        {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                                    <p className="font-bold text-gray-900">{calculateNights()} nights</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Guests</p>
                                    <p className="font-bold text-gray-900">{booking.guests} guests</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl sm:col-span-2">
                                    <p className="text-sm text-gray-600 mb-1">Booked On</p>
                                    <p className="font-bold text-gray-900">
                                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Guest Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <User className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-xl font-bold text-gray-900">Guest Information</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Guest Name</p>
                                    <p className="font-bold text-gray-900 text-lg">{booking.guestInfo?.name || booking.user?.name || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Email</p>
                                        <a
                                            href={`mailto:${booking.guestInfo?.email || booking.user?.email}`}
                                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                                        >
                                            <Mail className="h-4 w-4" />
                                            {booking.guestInfo?.email || booking.user?.email || 'N/A'}
                                        </a>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Phone</p>
                                        <a
                                            href={`tel:${booking.guestInfo?.phone || booking.user?.phone}`}
                                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                                        >
                                            <Phone className="h-4 w-4" />
                                            {booking.guestInfo?.phone || booking.user?.phone || 'N/A'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Special Requests */}
                        {booking.specialRequests && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Special Requests</h2>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-gray-700 leading-relaxed">{booking.specialRequests}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <IndianRupee className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 font-medium">Booking Amount</span>
                                    <span className="font-semibold text-gray-900">₹{booking.totalPrice?.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="font-bold text-emerald-600 text-xl">₹{booking.totalPrice?.toLocaleString()}</span>
                                </div>
                                {booking.advancePayment > 0 && (
                                    <div className="border-t border-gray-200 pt-3 space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                                            <span className="text-sm text-blue-700 font-medium font-bold">Advance Paid (30%)</span>
                                            <span className="font-bold text-blue-700">₹{booking.advancePayment?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                                            <span className="text-sm text-orange-700 font-medium font-bold">Balance at Site</span>
                                            <span className="font-bold text-orange-700">₹{booking.balancePayment?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                                {booking.vendorPayout && (
                                    <div className="border-t border-gray-200 pt-3 space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                            <span className="text-sm text-gray-700 font-medium font-bold">Your Earnings (Advance)</span>
                                            <span className="font-bold text-green-600">
                                                ₹{booking.vendorPayout.amount?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-600 font-medium">Platform Commission ({booking.vendorPayout.commissionRate}%)</span>
                                            <span className="font-medium text-gray-500 line-through">₹{booking.vendorPayout.commissionAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-3">
                                    <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                                    <p className={`font-bold text-lg ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                        {booking.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {booking.status === 'pending_confirmation' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleAcceptBooking}
                                        disabled={actionLoading}
                                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        Accept Booking
                                    </button>
                                    <button
                                        onClick={handleRejectBooking}
                                        disabled={actionLoading}
                                        className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                    >
                                        <XCircle className="h-5 w-5" />
                                        Reject Booking
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Contact Guest */}
                        {booking.status === 'confirmed' && (
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
                                <h3 className="font-bold text-emerald-900 mb-4 text-lg">Contact Guest</h3>
                                <div className="space-y-3">
                                    <a
                                        href={`tel:${booking.guestInfo?.phone || booking.user?.phone}`}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl text-emerald-700 hover:text-emerald-800 font-semibold transition-colors border border-emerald-100 hover:border-emerald-200"
                                    >
                                        <Phone className="h-5 w-5" />
                                        Call Guest
                                    </a>
                                    <a
                                        href={`mailto:${booking.guestInfo?.email || booking.user?.email}`}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl text-emerald-700 hover:text-emerald-800 font-semibold transition-colors border border-emerald-100 hover:border-emerald-200"
                                    >
                                        <Mail className="h-5 w-5" />
                                        Email Guest
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Confirmation Modal */}
            <ConfirmationModal
                {...modalConfig}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onInputChange={(val) => setModalConfig(prev => ({ ...prev, inputValue: val }))}
                onConfirm={() => modalConfig.onConfirm(modalConfig.inputValue)}
                loading={actionLoading}
            />
        </div>
    );
};

export default BookingDetails;
