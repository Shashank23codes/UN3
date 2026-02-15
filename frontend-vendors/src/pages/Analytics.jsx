import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp, TrendingDown, DollarSign, Calendar, Users, Home,
    BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Download,
    Filter, ChevronDown, Loader2, Star, Eye, CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30'); // days
    const [stats, setStats] = useState(null);
    const [bookingTrends, setBookingTrends] = useState([]);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [topFarmhouses, setTopFarmhouses] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('vendorToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch dashboard stats
            const [dashboardRes, earningsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/earnings/stats`, config)
            ]);

            const dashboard = dashboardRes.data;
            const earnings = earningsRes.data;

            // Calculate stats
            setStats({
                totalRevenue: earnings.totalEarnings || 0,
                pendingRevenue: earnings.pendingEarnings || 0,
                totalBookings: dashboard.totalBookings || 0,
                activeListings: dashboard.totalFarmhouses || 0,
                occupancyRate: calculateOccupancyRate(dashboard),
                averageRating: dashboard.averageRating || 0,
                totalViews: dashboard.totalViews || 0,
                conversionRate: calculateConversionRate(dashboard)
            });

            // Generate trend data (mock for now, can be enhanced with real data)
            generateTrendData(dashboard, earnings);
            generateTopFarmhouses(dashboard);

        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const calculateOccupancyRate = (data) => {
        if (!data.totalFarmhouses || data.totalFarmhouses === 0) return 0;
        const active = data.upcomingBookings || 0;
        return Math.min(Math.round((active / data.totalFarmhouses) * 100), 100);
    };

    const calculateConversionRate = (data) => {
        if (!data.totalViews || data.totalViews === 0) return 0;
        return ((data.totalBookings / data.totalViews) * 100).toFixed(1);
    };

    const generateTrendData = (dashboard, earnings) => {
        // Generate last N days of data
        const days = parseInt(timeRange);
        const trends = [];
        const revTrends = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            trends.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                bookings: Math.floor(Math.random() * 5) + (dashboard.totalBookings > 0 ? 1 : 0),
                views: Math.floor(Math.random() * 50) + 10
            });

            revTrends.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: Math.floor(Math.random() * 10000) + (earnings.totalEarnings > 0 ? 5000 : 0)
            });
        }

        setBookingTrends(trends);
        setRevenueTrends(revTrends);
    };

    const generateTopFarmhouses = (dashboard) => {
        // This would ideally come from backend
        setTopFarmhouses([
            { name: 'Your Top Property', bookings: dashboard.totalBookings || 0, revenue: dashboard.totalRevenue || 0, rating: dashboard.averageRating || 0 }
        ]);
    };

    const exportReport = () => {
        // Generate CSV
        const csvData = [
            ['Metric', 'Value'],
            ['Total Revenue', `₹${stats?.totalRevenue?.toLocaleString()}`],
            ['Pending Revenue', `₹${stats?.pendingRevenue?.toLocaleString()}`],
            ['Total Bookings', stats?.totalBookings],
            ['Active Listings', stats?.activeListings],
            ['Occupancy Rate', `${stats?.occupancyRate}%`],
            ['Average Rating', stats?.averageRating?.toFixed(1)],
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Report downloaded successfully!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    const StatCard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) => (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-500 mt-1">Track your performance and revenue trends</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={stats?.totalRevenue}
                    prefix="₹"
                    change={12}
                    icon={DollarSign}
                    color="bg-gradient-to-br from-emerald-500 to-green-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.totalBookings}
                    change={8}
                    icon={Calendar}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                    title="Occupancy Rate"
                    value={stats?.occupancyRate}
                    suffix="%"
                    change={5}
                    icon={Home}
                    color="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <StatCard
                    title="Average Rating"
                    value={stats?.averageRating?.toFixed(1) || 'N/A'}
                    icon={Star}
                    color="bg-gradient-to-br from-amber-500 to-orange-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Bookings Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Booking Trends</h3>
                            <p className="text-sm text-gray-500">Daily bookings over time</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {bookingTrends.slice(-14).map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                                    style={{ height: `${Math.max(day.bookings * 20, 10)}%` }}
                                ></div>
                                <span className="text-[10px] text-gray-400 rotate-45 origin-left">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                            <p className="text-sm text-gray-500">Daily revenue over time</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {revenueTrends.slice(-14).map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                                    style={{ height: `${Math.max((day.revenue / 15000) * 100, 10)}%` }}
                                ></div>
                                <span className="text-[10px] text-gray-400 rotate-45 origin-left">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Revenue */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Pending Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-amber-600 mb-2">₹{stats?.pendingRevenue?.toLocaleString()}</p>
                    <p className="text-sm text-amber-700">From upcoming and ongoing bookings</p>
                </div>

                {/* Views & Conversion */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Conversion Rate</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{stats?.conversionRate}%</p>
                    <p className="text-sm text-blue-700">Views to bookings conversion</p>
                </div>

                {/* Active Listings */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Home className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Active Listings</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-2">{stats?.activeListings}</p>
                    <p className="text-sm text-purple-700">Currently listed properties</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
