import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, CheckCircle, XCircle, Clock, Users, DollarSign,
    ChevronRight, Loader2, Eye, Home, IndianRupee, TrendingUp,
    Filter
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const Bookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
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
        inputValue: '',
        bookingId: null
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/vendor-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Fetched bookings:', res.data);
            setBookings(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (id, action) => {
        if (action === 'confirm') {
            setModalConfig({
                isOpen: true,
                title: 'Accept Booking',
                message: 'Are you sure you want to accept this booking and capture the payment?',
                confirmText: 'Accept',
                type: 'default',
                showInput: false,
                onConfirm: (reason) => performStatusUpdate(id, 'confirm', reason)
            });
        } else {
            setModalConfig({
                isOpen: true,
                title: 'Reject Booking',
                message: 'Please provide a reason for rejecting this booking. The payment will be refunded.',
                confirmText: 'Reject',
                type: 'danger',
                showInput: true,
                inputValue: '',
                onConfirm: (reason) => performStatusUpdate(id, 'reject', reason)
            });
        }
    };

    const performStatusUpdate = async (id, action, reason) => {
        if (action === 'reject' && !reason && modalConfig.showInput) {
            toast.error('Reason is required for rejection');
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('vendorToken');
            const endpoint = action === 'confirm'
                ? `${import.meta.env.VITE_API_URL}/api/payments/capture/${id}`
                : `${import.meta.env.VITE_API_URL}/api/payments/reject/${id}`;

            await axios.post(endpoint, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
            toast.success(`Booking ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully`);
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update booking status');
        } finally {
            setActionLoading(false);
        }
    };

    const filterBookings = (status) => {
        const now = new Date();

        if (status === 'upcoming') {
            // Show bookings that are:
            // 1. Pending confirmation
            // 2. Confirmed and haven't checked out yet (but NOT checked in)
            return bookings.filter(b => {
                const checkOutDate = new Date(b.checkOut);

                // Include pending confirmations
                if (b.status === 'pending_confirmation' || b.status === 'pending') {
                    return true;
                }

                // Include confirmed bookings that haven't started or are ongoing (but not checked in)
                if (b.status === 'confirmed' && checkOutDate >= now) {
                    return true;
                }

                return false;
            });
        } else if (status === 'checked_in') {
            // Show only checked-in bookings (active stays)
            return bookings.filter(b => b.status === 'checked_in');
        } else if (status === 'completed') {
            // Show bookings that are:
            // 1. Marked as completed
            // 2. Confirmed but checkout date has passed
            return bookings.filter(b => {
                const checkOutDate = new Date(b.checkOut);

                // Explicitly completed bookings
                if (b.status === 'completed') {
                    return true;
                }

                // Confirmed bookings past their checkout date (but not checked in)
                if (b.status === 'confirmed' && checkOutDate < now) {
                    return true;
                }

                return false;
            });
        } else if (status === 'cancelled') {
            // Show cancelled or rejected bookings
            return bookings.filter(b => ['cancelled', 'rejected'].includes(b.status));
        }
        return bookings;
    };

    const getStatusBadge = (status) => {
        const badges = {
            confirmed: { color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle, label: 'Confirmed' },
            pending_confirmation: { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock, label: 'Pending' },
            pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock, label: 'Pending' },
            checked_in: { color: 'bg-purple-50 text-purple-700 border-purple-100', icon: CheckCircle, label: 'Checked In' },
            rejected: { color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle, label: 'Rejected' },
            cancelled: { color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle, label: 'Cancelled' },
            completed: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: CheckCircle, label: 'Completed' }
        };
        const badge = badges[status] || badges.pending_confirmation;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {badge.label}
            </span>
        );
    };

    const getStats = () => {
        return {
            total: bookings.length,
            upcoming: filterBookings('upcoming').length,
            checkedIn: filterBookings('checked_in').length,
            completed: filterBookings('completed').length,
            cancelled: filterBookings('cancelled').length
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading bookings...</p>
                </div>
            </div>
        );
    }

    const filteredBookings = filterBookings(activeTab);
    const stats = getStats();

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Bookings</h1>
                <p className="text-gray-600 mt-2">Manage your reservations and requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-24 w-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        <p className="text-sm text-gray-500 mt-1">All bookings</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="h-24 w-24 text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Upcoming</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
                        <p className="text-sm text-gray-500 mt-1">Active bookings</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Checked In</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.checkedIn}</p>
                        <p className="text-sm text-gray-500 mt-1">Active stays</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Completed</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
                        <p className="text-sm text-gray-500 mt-1">Past bookings</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <XCircle className="h-24 w-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Cancelled</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.cancelled}</p>
                        <p className="text-sm text-gray-500 mt-1">Rejected/Cancelled</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="border-b border-gray-100 px-6">
                    <nav className="-mb-px flex space-x-8">
                        {['upcoming', 'checked_in', 'completed', 'cancelled'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm capitalize transition-colors ${activeTab === tab
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab === 'checked_in' ? 'Checked In' : tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Bookings List */}
                <div className="p-6">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                            <p className="text-gray-500 mt-1">There are no bookings in this category.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <div key={booking._id} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 transition-all hover:shadow-md hover:border-emerald-100">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        {/* Farmhouse & Date Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <img
                                                src={booking.farmhouse?.images[0] || 'https://via.placeholder.com/100'}
                                                alt="Farmhouse"
                                                className="h-20 w-20 rounded-xl object-cover bg-gray-200 flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{booking.farmhouse?.name}</h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span>{new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span>{booking.guests} Guests</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="flex-1 lg:border-l lg:border-r border-gray-200 lg:px-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {booking.user?.name?.charAt(0) || 'G'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{booking.user?.name || 'Guest User'}</p>
                                                    <p className="text-xs text-gray-500">{booking.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-gray-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-600">Total Amount</span>
                                                    <span className="font-bold text-gray-900">₹{booking.totalPrice?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">Paid (30%)</span>
                                                    <span className="font-medium text-green-600">₹{Math.round((booking.totalPrice || 0) * 0.3).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions & Status */}
                                        <div className="flex flex-col items-end gap-3 min-w-[160px]">
                                            {getStatusBadge(booking.status)}

                                            {booking.status === 'pending_confirmation' && (
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'reject')}
                                                        className="flex-1 px-3 py-2 border border-red-200 text-red-700 rounded-xl hover:bg-red-50 text-sm font-medium transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking._id, 'confirm')}
                                                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm"
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => navigate(`/dashboard/bookings/${booking._id}`)}
                                                className="flex items-center gap-2 text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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

export default Bookings;
