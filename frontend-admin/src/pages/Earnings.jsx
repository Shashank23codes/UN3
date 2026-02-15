import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, Calendar, Download,
    IndianRupee, ArrowUpRight, ArrowDownRight,
    Building2, Receipt, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { exportToCSV } from '../utils/exportHelper';

const Earnings = () => {
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        thisMonth: 0,
        lastMonth: 0,
        breakdown: [],
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('all'); // all, month, week

    useEffect(() => {
        fetchEarnings();
    }, [dateRange]);

    const fetchEarnings = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/admin/earnings?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEarnings(res.data);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading earnings data...</p>
                </div>
            </div>
        );
    }

    const monthGrowth = earnings.monthGrowth || 0;
    const isPositiveGrowth = monthGrowth >= 0;

    const handleExport = () => {
        const headers = ['Date', 'Booking Ref', 'Vendor', 'Property', 'Total Amount', 'Commission', 'Status'];
        const data = earnings.recentTransactions.map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            t.receiptNumber || t._id,
            t.vendor?.name || 'N/A',
            t.farmhouse?.name || 'N/A',
            t.totalPrice,
            t.vendorPayout?.commissionAmount || 0,
            t.splitPayment?.splitStatus || 'pending'
        ]);
        exportToCSV(data, headers, `earnings_export_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Earnings report exported');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Earnings</h1>
                    <p className="text-gray-500 mt-1">Track platform commission and revenue</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="week">This Week</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Earnings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <IndianRupee className="h-24 w-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Earnings</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            ₹{earnings.totalEarnings?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">5% commission from all bookings</p>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">This Month</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            ₹{earnings.thisMonth?.toLocaleString() || 0}
                        </p>
                        <div className={`flex items-center gap-1 text-xs mt-1 ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositiveGrowth ? (
                                <ArrowUpRight className="h-3 w-3" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3" />
                            )}
                            {Math.abs(monthGrowth)}% from last month
                        </div>
                    </div>
                </div>

                {/* Last Month */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Last Month</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            ₹{earnings.lastMonth?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Previous month earnings</p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>

                {earnings.recentTransactions && earnings.recentTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Commission (5%)</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {earnings.recentTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {transaction.farmhouse?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {transaction.receiptNumber || `#${transaction._id.slice(-8)}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    {transaction.vendor?.name?.charAt(0) || 'V'}
                                                </div>
                                                <p className="text-sm text-gray-900">{transaction.vendor?.name || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-semibold text-gray-900">
                                                ₹{transaction.totalPrice?.toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-bold text-green-600">
                                                ₹{transaction.vendorPayout?.commissionAmount?.toLocaleString() || 0}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${transaction.splitPayment?.splitStatus === 'processed'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : transaction.splitPayment?.splitStatus === 'failed'
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                {transaction.splitPayment?.splitStatus === 'processed' && (
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                )}
                                                {transaction.splitPayment?.splitStatus || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
                        <p className="text-gray-500 mt-1">Commission earnings will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Earnings;
