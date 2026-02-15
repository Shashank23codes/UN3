import React, { useState, useEffect } from 'react';
import {
    Users, Calendar, DollarSign, TrendingUp,
    Store, ShieldCheck, Clock, ArrowRight,
    Activity, CheckCircle, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVendors: 0,
        verifiedVendors: 0,
        totalBookings: 0,
        totalEarnings: 0,
        recentBookings: [],
        pendingVerifications: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back! Here's what's happening on your platform today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Total Vendors */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Store className="h-24 w-24 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Store className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Vendors</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVendors || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Registered partners</p>
                    </div>
                </div>

                {/* Verified Vendors */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Verified</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verifiedVendors || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Active vendors</p>
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-24 w-24 text-orange-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Users</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Registered customers</p>
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Bookings</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">All time bookings</p>
                    </div>
                </div>

                {/* Total Earnings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Earnings</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalEarnings?.toLocaleString() || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Platform commission</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Verifications */}
                {stats.pendingVerifications > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    <h3 className="text-sm font-semibold text-orange-900 uppercase tracking-wider">Action Required</h3>
                                </div>
                                <p className="text-2xl font-bold text-orange-900 mt-2">{stats.pendingVerifications}</p>
                                <p className="text-sm text-orange-700 mt-1">Vendors pending verification</p>
                            </div>
                            <Link
                                to="/vendors"
                                className="px-4 py-2 bg-white text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                Review
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                        {stats.recentBookings && stats.recentBookings.length > 0 ? (
                            stats.recentBookings.slice(0, 3).map((booking, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {booking.farmhouse?.name || 'New Booking'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {booking.user?.name || 'Customer'} • {new Date(booking.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                    <Link
                        to="/bookings"
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                        View All Bookings
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
