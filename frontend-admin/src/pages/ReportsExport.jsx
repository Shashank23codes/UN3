import React, { useState } from 'react';
import axios from 'axios';
import {
    Download, FileSpreadsheet, Users, Building, Calendar,
    DollarSign, Loader2, Check, ChevronDown, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';

const ReportsExport = () => {
    const [loading, setLoading] = useState({});
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const exportReport = async (type) => {
        setLoading(prev => ({ ...prev, [type]: true }));

        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let data = [];
            let headers = [];
            let filename = '';

            switch (type) {
                case 'users':
                    const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config);
                    headers = ['ID', 'Name', 'Email', 'Phone', 'Created At', 'Total Bookings'];
                    data = usersRes.data.map(u => [
                        u._id,
                        u.name,
                        u.email,
                        u.phone || 'N/A',
                        new Date(u.createdAt).toLocaleDateString(),
                        u.bookings?.length || 0
                    ]);
                    filename = `users_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'vendors':
                    const vendorsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/vendors`, config);
                    headers = ['ID', 'Name', 'Email', 'Phone', 'Verified', 'KYC Status', 'Farmhouses', 'Created At'];
                    data = vendorsRes.data.map(v => [
                        v._id,
                        v.name,
                        v.email,
                        v.phone || 'N/A',
                        v.isVerified ? 'Yes' : 'No',
                        v.kycStatus || 'pending',
                        v.farmhouses?.length || 0,
                        new Date(v.createdAt).toLocaleDateString()
                    ]);
                    filename = `vendors_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'bookings':
                    const bookingsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, config);
                    headers = ['Booking ID', 'Property', 'Guest', 'Check-in', 'Check-out', 'Status', 'Amount', 'Payment Status'];
                    data = bookingsRes.data
                        .filter(b => {
                            const bookingDate = new Date(b.createdAt);
                            return bookingDate >= new Date(dateRange.startDate) && bookingDate <= new Date(dateRange.endDate);
                        })
                        .map(b => [
                            b._id.slice(-8).toUpperCase(),
                            b.farmhouse?.name || 'N/A',
                            b.user?.name || 'N/A',
                            new Date(b.checkIn).toLocaleDateString(),
                            new Date(b.checkOut).toLocaleDateString(),
                            b.status,
                            `₹${b.totalAmount?.toLocaleString()}`,
                            b.paymentStatus
                        ]);
                    filename = `bookings_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
                    break;

                case 'earnings':
                    const earningsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, config);
                    const completedBookings = earningsRes.data.filter(b =>
                        b.status === 'completed' || b.paymentStatus === 'paid'
                    );
                    headers = ['Booking ID', 'Property', 'Vendor', 'Booking Amount', 'Platform Fee (10%)', 'Vendor Payout', 'Date'];
                    data = completedBookings.map(b => {
                        const platformFee = (b.totalAmount || 0) * 0.1;
                        const vendorPayout = (b.totalAmount || 0) * 0.9;
                        return [
                            b._id.slice(-8).toUpperCase(),
                            b.farmhouse?.name || 'N/A',
                            b.farmhouse?.vendor?.name || 'N/A',
                            `₹${b.totalAmount?.toLocaleString()}`,
                            `₹${platformFee.toLocaleString()}`,
                            `₹${vendorPayout.toLocaleString()}`,
                            new Date(b.createdAt).toLocaleDateString()
                        ];
                    });
                    filename = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                default:
                    throw new Error('Invalid report type');
            }

            // Generate CSV
            const csvContent = [
                headers.join(','),
                ...data.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded!`);
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error(`Failed to export ${type} report`);
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const ReportCard = ({ title, description, icon: Icon, color, type, count }) => (
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {count !== undefined && (
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                )}
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            <button
                onClick={() => exportReport(type)}
                disabled={loading[type]}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {loading[type] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
                Export CSV
            </button>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports & Export</h1>
                    <p className="text-gray-500 mt-1">Download platform data as CSV files</p>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportCard
                    title="Users Report"
                    description="Export all registered users with their details and booking history"
                    icon={Users}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    type="users"
                />
                <ReportCard
                    title="Vendors Report"
                    description="Export vendor information including KYC status and farmhouse count"
                    icon={Building}
                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                    type="vendors"
                />
                <ReportCard
                    title="Bookings Report"
                    description="Export all bookings within the selected date range"
                    icon={Calendar}
                    color="bg-gradient-to-br from-purple-500 to-violet-600"
                    type="bookings"
                />
                <ReportCard
                    title="Earnings Report"
                    description="Export revenue breakdown with platform fees and vendor payouts"
                    icon={DollarSign}
                    color="bg-gradient-to-br from-amber-500 to-orange-600"
                    type="earnings"
                />
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <FileSpreadsheet className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Quick Export Tips</h3>
                </div>
                <ul className="space-y-2 text-white/90">
                    <li className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        CSV files can be opened in Excel, Google Sheets, or any spreadsheet software
                    </li>
                    <li className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Use the date filter above to narrow down booking and earnings reports
                    </li>
                    <li className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Reports include all data at the time of export
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ReportsExport;
