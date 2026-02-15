import React, { useState, useEffect } from 'react';
import {
    Calendar, Search, Filter, Eye, Download,
    CheckCircle, Clock, XCircle, AlertCircle,
    User, Home, IndianRupee, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { exportToCSV } from '../utils/exportHelper';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.farmhouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStats = () => {
        return {
            total: bookings.length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            pending: bookings.filter(b => b.status === 'pending' || b.status === 'pending_confirmation').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            totalRevenue: bookings
                .filter(b => b.status !== 'cancelled')
                .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
        };
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock, label: 'Pending' },
            pending_confirmation: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: AlertCircle, label: 'Pending Confirmation' },
            confirmed: { color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle, label: 'Confirmed' },
            checked_in: { color: 'bg-purple-50 text-purple-700 border-purple-100', icon: CheckCircle, label: 'Checked In' },
            completed: { color: 'bg-gray-50 text-gray-700 border-gray-100', icon: CheckCircle, label: 'Completed' },
            cancelled: { color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle, label: 'Cancelled' }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {badge.label}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', label: 'Pending' },
            authorized: { color: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Authorized' },
            partially_paid: { color: 'bg-orange-50 text-orange-700 border-orange-100', label: 'Partial' },
            fully_paid: { color: 'bg-green-50 text-green-700 border-green-100', label: 'Paid' },
            paid: { color: 'bg-green-50 text-green-700 border-green-100', label: 'Paid' },
            failed: { color: 'bg-red-50 text-red-700 border-red-100', label: 'Failed' },
            refunded: { color: 'bg-gray-50 text-gray-700 border-gray-100', label: 'Refunded' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading bookings...</p>
                </div>
            </div>
        );
    }

    const stats = getStats();

    const handleExport = () => {
        const headers = ['Booking ID', 'Property', 'User', 'Vendor', 'Check-in', 'Check-out', 'Guests', 'Total Price', 'Status', 'Payment Status'];
        const data = filteredBookings.map(b => [
            b._id,
            b.farmhouse?.name || 'N/A',
            b.user?.name || 'N/A',
            b.vendor?.name || 'N/A',
            new Date(b.checkIn).toLocaleDateString(),
            new Date(b.checkOut).toLocaleDateString(),
            b.guests,
            b.totalPrice,
            b.status,
            b.paymentStatus
        ]);
        exportToCSV(data, headers, `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Bookings exported successfully');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500 mt-1">View and manage all property bookings</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download className="h-4 w-4" />
                    Export Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-24 w-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Bookings</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        <p className="text-sm text-gray-500 mt-1">All time bookings</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Confirmed</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.confirmed}</p>
                        <p className="text-sm text-gray-500 mt-1">Active bookings</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="h-24 w-24 text-orange-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Pending</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
                        <p className="text-sm text-gray-500 mt-1">Awaiting confirmation</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <IndianRupee className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Revenue</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">From all bookings</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filters */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by farmhouse, user, or vendor..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-all"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="pending_confirmation">Pending Confirmation</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked_in">Checked In</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="overflow-x-auto">
                    {filteredBookings.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                    <Home className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{booking.farmhouse?.name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{booking.guests} guests</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{booking.user?.name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{booking.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{booking.vendor?.name || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Calendar className="h-3 w-3" />
                                                <div>
                                                    <p className="text-sm text-gray-900">
                                                        {new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        to {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-semibold text-gray-900">₹{booking.totalPrice?.toLocaleString()}</p>
                                            {booking.splitPayment?.adminAmount > 0 && (
                                                <p className="text-xs text-green-600">
                                                    Commission: ₹{booking.splitPayment.adminAmount.toLocaleString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getPaymentBadge(booking.paymentStatus)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bookings;
