import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, Calendar, Shield,
    ShieldAlert, MapPin, Clock, CheckCircle, XCircle,
    User, Home, IndianRupee, TrendingUp, Activity
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/admin/users/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(response.data.user);
            setBookings(response.data.bookings);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!window.confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} this user?`)) return;

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/status`,
                { isBanned: !user.isBanned },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(response.data.user);
            toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'} successfully`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update user status');
        }
    };

    const getBookingStats = () => {
        const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        return { totalSpent, completedBookings, cancelledBookings };
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock, label: 'Pending' },
            pending_confirmation: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock, label: 'Pending Confirmation' },
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const stats = getBookingStats();

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/users')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Users
            </button>

            {/* User Profile Header */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-3xl font-bold ring-4 ring-white shadow-lg">
                            {user.picture ? (
                                <img src={user.picture} alt={user.name} className="h-24 w-24 rounded-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600 mt-1">User ID: {user._id.slice(-8)}</p>
                            <div className="flex items-center gap-2 mt-3">
                                {user.isBanned ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-100">
                                        <ShieldAlert className="h-4 w-4 mr-1" />
                                        Banned Account
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Active Account
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleStatus}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm ${user.isBanned
                                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
                            }`}
                    >
                        {user.isBanned ? (
                            <>
                                <Shield className="h-5 w-5" />
                                Unban User
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="h-5 w-5" />
                                Ban User
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mt-2">{user.email}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Phone</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mt-2">{user.phone || 'Not provided'}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Joined</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mt-2">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Booking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-24 w-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Activity className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Bookings</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
                        <p className="text-sm text-gray-500 mt-1">{stats.completedBookings} completed</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <IndianRupee className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Spent</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Lifetime value</p>
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
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.cancelledBookings}</p>
                        <p className="text-sm text-gray-500 mt-1">Cancellation rate</p>
                    </div>
                </div>
            </div>

            {/* Booking History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900">Booking History</h2>
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Home className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                        <p className="text-gray-500 mt-1">This user hasn't made any bookings</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in / Check-out</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                    <Home className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{booking.farmhouse?.name || 'Unknown Property'}</div>
                                                    <div className="text-xs text-gray-500">ID: {booking._id.slice(-8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} nights
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-semibold text-gray-900">₹{booking.totalPrice?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetails;
