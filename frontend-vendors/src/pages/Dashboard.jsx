import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Home,
    Calendar,
    DollarSign,
    TrendingUp,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    IndianRupee,
    Plus,
    Settings,
    ArrowUpRight,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CheckInVerification from '../components/CheckInVerification';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [kycStatus, setKycStatus] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('vendorInfo');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchDashboardStats();
        fetchKYCStatus();
        fetchVendorProfile();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error(error);
            // Don't toast on 404/500 for dashboard to avoid spamming on load if backend is down
        } finally {
            setLoading(false);
        }
    };

    const fetchKYCStatus = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/kyc/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setKycStatus(res.data);
        } catch (error) {
            console.error('KYC status fetch error:', error);
        }
    };

    const fetchVendorProfile = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendors/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            // Update localStorage with latest info
            localStorage.setItem('vendorInfo', JSON.stringify(res.data));
        } catch (error) {
            console.error('Profile fetch error:', error);
        }
    };

    const handleVerificationSuccess = () => {
        // Refresh dashboard stats after successful check-in
        fetchDashboardStats();
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', label: 'Pending' },
            pending_approval: { color: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Pending Approval' },
            approved: { color: 'bg-green-50 text-green-700 border-green-100', label: 'Approved' },
            confirmed: { color: 'bg-green-50 text-green-700 border-green-100', label: 'Confirmed' },
            checked_in: { color: 'bg-purple-50 text-purple-700 border-purple-100', label: 'Checked In' },
            completed: { color: 'bg-gray-50 text-gray-700 border-gray-100', label: 'Completed' },
            cancelled: { color: 'bg-red-50 text-red-700 border-red-100', label: 'Cancelled' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Verification Status Banner */}
            {!user?.isVerified && (
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-3xl shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        <ShieldCheck className="h-20 w-20 text-amber-600" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-amber-200">
                                <AlertTriangle className="h-6 w-6 text-amber-600 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-amber-900 tracking-tight">Account verification required</h2>
                                <p className="text-amber-800 mt-1 font-medium max-w-2xl">
                                    Your account is currently <span className="underline decoration-wavy underline-offset-4">pending approval</span>.
                                    Please ensure your profile is complete, especially your <span className="font-bold">contact number</span>,
                                    as it is mandatory for the admin to verify and approve your account.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/dashboard/profile"
                            className="whitespace-nowrap px-6 py-3 bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 hover:scale-105 transition-all active:scale-95"
                        >
                            Complete Profile
                        </Link>
                    </div>
                </div>
            )}
            {/* New Premium Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Welcome back, <span className="text-emerald-600">{user?.name?.split(' ')[0]}</span>! 👋
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Manage your properties and track your success in one place.
                    </p>
                </div>
                <Link
                    to="/dashboard/add-farmhouse"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95 group"
                >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    List New Property
                </Link>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <IndianRupee className="h-24 w-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl">
                                <IndianRupee className="h-6 w-6 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Earnings</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-gray-900 leading-none">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 font-medium flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Lifetime revenue
                        </p>
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Activity</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900 leading-none">{stats?.totalBookings || 0}</span>
                        <p className="text-sm text-gray-500 mt-3 font-medium flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-blue-500" />
                            Total reservations
                        </p>
                    </div>
                </div>

                {/* Active Properties */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/5 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Home className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <Home className="h-6 w-6 text-purple-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inventory</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-gray-900 leading-none">
                                {stats?.activeListings || 0}
                            </span>
                            <span className="text-lg text-gray-400 font-bold">/ {stats?.totalFarmhouses || 0}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 font-medium flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                            Active listings
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-xl">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h3 className="font-extrabold text-gray-900 tracking-tight">Recent Bookings</h3>
                        </div>
                        <Link
                            to="/dashboard/bookings"
                            className="flex items-center gap-1.5 text-sm text-emerald-600 font-bold hover:gap-2 transition-all"
                        >
                            View Analytics
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {stats?.recentBookings?.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No bookings yet</h3>
                                <p className="text-gray-500 mt-2 max-w-xs mx-auto">Once guests start booking your properties, they will appear here.</p>
                                <Link to="/dashboard/add-farmhouse" className="mt-6 inline-flex text-emerald-600 font-bold hover:underline">
                                    List your first property →
                                </Link>
                            </div>
                        ) : (
                            stats?.recentBookings?.map((booking) => (
                                <div key={booking._id} className="p-6 flex items-center justify-between hover:bg-gray-50/80 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center text-emerald-600 font-extrabold text-xl shadow-inner border border-emerald-100/50">
                                            {booking.customerDetails?.name?.charAt(0) || 'G'}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                {booking.customerDetails?.name || 'Guest'}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium italic">
                                                <Home className="h-3.5 w-3.5 text-gray-400" />
                                                {booking.farmhouse?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-extrabold text-gray-900 tracking-tight italic">₹{booking.totalAmount?.toLocaleString()}</p>
                                        <div className="mt-2 text-[10px] sm:text-xs">
                                            {getStatusBadge(booking.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Check-in & New Quick Actions Grid */}
                <div className="space-y-8">
                    {/* Check-in Verification - Keeping its existing good component */}
                    <CheckInVerification onVerificationSuccess={handleVerificationSuccess} />

                    {/* New Visual Quick Actions Grid */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest px-1">Quick Management</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <Link
                                to="/dashboard/add-farmhouse"
                                className="group p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all flex items-center gap-4"
                            >
                                <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 transition-colors">
                                    <Plus className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors">Add Property</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">List a new farmhouse today</p>
                                </div>
                            </Link>

                            <Link
                                to="/dashboard/bookings"
                                className="group p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all flex items-center gap-4"
                            >
                                <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors">
                                    <Calendar className="h-6 w-6 text-blue-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Bookings</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Check status and details</p>
                                </div>
                            </Link>

                            <Link
                                to="/dashboard/earnings"
                                className="group p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all flex items-center gap-4"
                            >
                                <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-600 transition-colors">
                                    <IndianRupee className="h-6 w-6 text-purple-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">Payout History</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Track and manage earnings</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
