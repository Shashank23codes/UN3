import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp, DollarSign, Users, Home, Calendar,
    BarChart3, ArrowUpRight, ArrowDownRight, Download,
    ChevronDown, Loader2, Building, UserCheck, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [dashboardRes, bookingsRes, vendorsRes, usersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/vendors`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config)
            ]);

            const dashboard = dashboardRes.data;
            const bookings = bookingsRes.data;
            const vendors = vendorsRes.data;
            const users = usersRes.data;

            // Calculate comprehensive stats
            const totalRevenue = bookings
                .filter(b => b.status !== 'cancelled')
                .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
            const platformFees = totalRevenue * 0.1; // 10% platform fee
            const completedBookings = bookings.filter(b => b.status === 'completed').length;
            const activeVendors = vendors.filter(v => v.isVerified).length;

            setStats({
                totalRevenue,
                platformFees,
                totalBookings: bookings.length,
                completedBookings,
                totalUsers: users.length,
                totalVendors: vendors.length,
                activeVendors,
                totalFarmhouses: dashboard.totalFarmhouses || 0,
                pendingApprovals: vendors.filter(v => !v.isVerified).length,
                avgBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0
            });

            // Generate trend data
            generateTrends(bookings);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const generateTrends = (bookings) => {
        const days = parseInt(timeRange);
        const trends = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayBookings = bookings.filter(b => {
                const bookingDate = new Date(b.createdAt);
                bookingDate.setHours(0, 0, 0, 0);
                return bookingDate.getTime() === date.getTime();
            });

            trends.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                bookings: dayBookings.length,
                revenue: dayBookings
                    .filter(b => b.status !== 'cancelled')
                    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
            });
        }

        setTrends(trends);
    };

    const exportReport = () => {
        const csvData = [
            ['Metric', 'Value'],
            ['Total Revenue', `₹${stats?.totalRevenue?.toLocaleString()}`],
            ['Platform Fees', `₹${stats?.platformFees?.toLocaleString()}`],
            ['Total Bookings', stats?.totalBookings],
            ['Completed Bookings', stats?.completedBookings],
            ['Total Users', stats?.totalUsers],
            ['Total Vendors', stats?.totalVendors],
            ['Active Vendors', stats?.activeVendors],
            ['Total Farmhouses', stats?.totalFarmhouses],
            ['Pending Approvals', stats?.pendingApprovals],
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `platform_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Report exported successfully!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    const StatCard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) => (
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-4">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Platform Analytics</h1>
                    <p className="text-gray-500 mt-1">Comprehensive platform performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={exportReport}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={stats?.totalRevenue}
                    prefix="₹"
                    change={15}
                    icon={DollarSign}
                    color="bg-gradient-to-br from-emerald-500 to-green-600"
                />
                <StatCard
                    title="Platform Earnings"
                    value={Math.round(stats?.platformFees)}
                    prefix="₹"
                    change={12}
                    icon={TrendingUp}
                    color="bg-gradient-to-br from-indigo-500 to-purple-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.totalBookings}
                    change={8}
                    icon={Calendar}
                    color="bg-gradient-to-br from-blue-500 to-cyan-600"
                />
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers}
                    change={20}
                    icon={Users}
                    color="bg-gradient-to-br from-pink-500 to-rose-600"
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Active Vendors"
                    value={stats?.activeVendors}
                    icon={UserCheck}
                    color="bg-gradient-to-br from-amber-500 to-orange-600"
                />
                <StatCard
                    title="Total Farmhouses"
                    value={stats?.totalFarmhouses}
                    icon={Building}
                    color="bg-gradient-to-br from-teal-500 to-emerald-600"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats?.pendingApprovals}
                    icon={Clock}
                    color="bg-gradient-to-br from-red-500 to-rose-600"
                />
                <StatCard
                    title="Avg Booking Value"
                    value={Math.round(stats?.avgBookingValue)}
                    prefix="₹"
                    icon={BarChart3}
                    color="bg-gradient-to-br from-violet-500 to-purple-600"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bookings Chart */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Booking Trends</h3>
                            <p className="text-sm text-gray-500">Daily bookings over time</p>
                        </div>
                    </div>
                    <div className="h-56 flex items-end gap-1">
                        {trends.slice(-14).map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all hover:from-indigo-600 hover:to-indigo-500"
                                    style={{ height: `${Math.max(day.bookings * 15, 5)}%` }}
                                    title={`${day.bookings} bookings`}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{trends[0]?.date}</span>
                        <span>{trends[trends.length - 1]?.date}</span>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                            <p className="text-sm text-gray-500">Daily revenue over time</p>
                        </div>
                    </div>
                    <div className="h-56 flex items-end gap-1">
                        {trends.slice(-14).map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:from-emerald-600 hover:to-emerald-500"
                                    style={{ height: `${Math.max((day.revenue / 50000) * 100, 5)}%` }}
                                    title={`₹${day.revenue.toLocaleString()}`}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{trends[0]?.date}</span>
                        <span>{trends[trends.length - 1]?.date}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
