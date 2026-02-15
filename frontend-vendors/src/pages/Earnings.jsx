import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, Loader2, Building, Wallet, ArrowUpRight, CreditCard, AlertCircle, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Earnings = () => {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayouts: 0,
        paidPayouts: 0,
        totalBookings: 0
    });
    const [loading, setLoading] = useState(true);
    const [payoutDetails, setPayoutDetails] = useState({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        preferredMethod: 'bank_transfer'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Fetch vendor bookings
            const bookingsRes = await axios.get(`${API_URL}/api/bookings/vendor-bookings`, config);
            const allBookings = bookingsRes.data;

            // Filter out cancelled bookings and bookings with cancelled payouts
            const bookingsData = allBookings.filter(b =>
                b.status !== 'cancelled' &&
                b.vendorPayout?.status !== 'cancelled'
            );

            // Calculate stats
            const totalEarnings = bookingsData.reduce((sum, b) => {
                let earning = b.vendorPayout?.amount || 0;
                // If checked in, add balance payment to earnings (collected at property)
                if (b.status === 'checked_in' || b.status === 'completed' || b.checkInVerified) {
                    earning += (b.balancePayment || 0);
                }
                return sum + earning;
            }, 0);

            const pendingPayouts = bookingsData
                .filter(b => b.vendorPayout?.status === 'pending')
                .reduce((sum, b) => sum + (b.vendorPayout?.amount || 0), 0);

            const paidPayouts = bookingsData
                .filter(b => b.vendorPayout?.status === 'paid')
                .reduce((sum, b) => sum + (b.vendorPayout?.amount || 0), 0);

            setBookings(bookingsData);
            setStats({
                totalEarnings,
                pendingPayouts,
                paidPayouts,
                totalBookings: bookingsData.length
            });

            // Fetch vendor profile for payout details
            const profileRes = await axios.get(`${API_URL}/api/vendors/me`, config);
            if (profileRes.data.payoutDetails) {
                setPayoutDetails(profileRes.data.payoutDetails);
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch earnings data');
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading earnings data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Earnings & Payouts</h1>
                    <p className="text-gray-600 mt-2">Track your revenue streams and manage payout details</p>
                </div>

                {/* Payout Method Card */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 rounded-2xl shadow-lg min-w-[300px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="h-24 w-24 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Building className="h-5 w-5 text-emerald-400" />
                            </div>
                            <Link to="/dashboard/kyc" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                Manage <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Payout Method</p>
                            <div className="font-bold text-lg">
                                {payoutDetails.preferredMethod === 'bank_transfer' && payoutDetails.accountNumber ? (
                                    <div className="flex flex-col">
                                        <span className="text-white">{payoutDetails.bankName}</span>
                                        <span className="text-gray-400 text-sm font-mono">**** **** **** {payoutDetails.accountNumber.slice(-4)}</span>
                                    </div>
                                ) : payoutDetails.preferredMethod === 'upi' && payoutDetails.upiId ? (
                                    <div className="flex flex-col">
                                        <span className="text-white">UPI Transfer</span>
                                        <span className="text-gray-400 text-sm">{payoutDetails.upiId}</span>
                                    </div>
                                ) : (
                                    <span className="text-yellow-400 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Setup Required
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="h-32 w-32 text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <Wallet className="h-6 w-6 text-emerald-600" />
                            </div>
                            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Total Revenue</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalEarnings)}</h3>
                        <p className="text-sm text-gray-500">Total realized revenue (Admin Payouts + Collected Balance)</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="h-32 w-32 text-yellow-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-yellow-50 rounded-xl">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">Pending</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.pendingPayouts)}</h3>
                        <p className="text-sm text-gray-500">Advance payments awaiting transfer from Admin</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Received</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.paidPayouts)}</h3>
                        <p className="text-sm text-gray-500">Total advance payments successfully received</p>
                    </div>
                </div>
            </div>

            {/* Bookings/Payouts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Booking Earnings</h3>
                        <p className="text-gray-500 mt-1">Detailed breakdown of your earnings per booking</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span>Showing {bookings.length} transactions</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-4">Date</th>
                                <th className="px-8 py-4">Property & Guest</th>
                                <th className="px-8 py-4">Booking Amount</th>
                                <th className="px-8 py-4">Admin Payout (Advance)</th>
                                <th className="px-8 py-4">Total Earning</th>
                                <th className="px-8 py-4">Payout Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                <DollarSign className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium">No earnings yet</p>
                                            <p className="text-gray-500 text-sm mt-1">Your booking earnings will appear here</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => {
                                    const isCheckedIn = booking.status === 'checked_in' || booking.status === 'completed' || booking.checkInVerified;
                                    const totalEarning = (booking.vendorPayout?.amount || 0) + (isCheckedIn ? (booking.balancePayment || 0) : 0);

                                    return (
                                        <tr key={booking._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{formatDate(booking.createdAt)}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 font-mono">{booking._id.slice(-6).toUpperCase()}</div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="font-medium text-gray-900">{booking.farmhouse?.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {booking.user?.name}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-medium text-gray-900">
                                                {formatCurrency(booking.totalPrice)}
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="font-medium text-emerald-600">{formatCurrency(booking.vendorPayout?.amount)}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">Advance - 5% Comm.</div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="font-bold text-gray-900 text-lg">{formatCurrency(totalEarning)}</div>
                                                {!isCheckedIn && (
                                                    <div className="text-xs text-yellow-600 font-medium mt-0.5 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> Partial (Advance Only)
                                                    </div>
                                                )}
                                                {isCheckedIn && (
                                                    <div className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Full (Inc. Balance)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-4">
                                                {booking.vendorPayout?.status === 'paid' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                        <Clock className="h-3 w-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Earnings;
