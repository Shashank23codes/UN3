import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircle, Clock, AlertCircle, Search, Filter, X,
    IndianRupee, Calendar, User, Home, Building2,
    ArrowRight, MoreVertical, Download, ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { exportToCSV } from '../utils/exportHelper';

const VendorPayouts = () => {
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [paidPayouts, setPaidPayouts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'paid'
    const [paymentDetails, setPaymentDetails] = useState({
        paymentMethod: 'bank_transfer',
        transactionReference: '',
        notes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [payoutsRes, summaryRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/payouts/pending`, config),
                axios.get(`${API_URL}/api/admin/payouts/summary`, config)
            ]);

            setPendingPayouts(payoutsRes.data);
            setSummary(summaryRes.data);

            // Fetch paid payouts from all vendors
            const allBookings = await axios.get(`${API_URL}/api/admin/bookings`, config);
            const paid = allBookings.data.filter(b => b.vendorPayout?.status === 'paid');
            setPaidPayouts(paid);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching payouts:', error);
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post(
                `${API_URL}/api/admin/payouts/${selectedBooking._id}/mark-paid`,
                paymentDetails,
                config
            );

            // Show success notification (you might want to add a toast library)
            alert('Payout marked as paid successfully!');
            setShowModal(false);
            setSelectedBooking(null);
            setPaymentDetails({
                paymentMethod: 'bank_transfer',
                transactionReference: '',
                notes: ''
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error marking payout:', error);
            alert('Failed to mark payout as paid');
        }
    };

    const openModal = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
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

    const getDaysPending = (createdAt) => {
        const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
        return days;
    };

    const handleExport = () => {
        const isPending = activeTab === 'pending';
        const dataToExport = isPending ? pendingPayouts : paidPayouts;
        const filename = isPending ? 'pending_payouts' : 'payout_history';

        const headers = ['Date', 'Booking Ref', 'Vendor', 'Property', 'Total Amount', 'Commission', 'Payout Amount', 'Status'];

        const data = dataToExport.map(p => [
            new Date(p.createdAt).toLocaleDateString(),
            p.receiptNumber || p._id,
            p.vendor?.name || 'N/A',
            p.farmhouse?.name || 'N/A',
            p.totalPrice,
            p.vendorPayout?.commissionAmount,
            p.vendorPayout?.amount,
            isPending ? 'Pending' : 'Paid'
        ]);

        exportToCSV(data, headers, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success(`Exported ${isPending ? 'pending requests' : 'payment history'}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading payouts data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Payouts</h1>
                    <p className="text-gray-500 mt-1">Manage and track vendor payments and commissions</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="h-24 w-24 text-orange-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Pending Payouts</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.pending.totalAmount)}</p>
                            <p className="text-sm text-gray-500 mt-1">{summary.pending.count} bookings waiting for payment</p>
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
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Paid This Month</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.paidThisMonth.totalAmount)}</p>
                            <p className="text-sm text-gray-500 mt-1">{summary.paidThisMonth.count} payments processed</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Building2 className="h-24 w-24 text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Vendors Pending</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.vendorsWithPending.length}</p>
                            <p className="text-sm text-gray-500 mt-1">Vendors awaiting payout</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-100 px-6 pt-4">
                    <div className="flex gap-6">
                        <button
                            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'pending'
                                ? 'text-rose-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending Requests
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {pendingPayouts.length}
                            </span>
                            {activeTab === 'pending' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-t-full"></div>
                            )}
                        </button>
                        <button
                            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'paid'
                                ? 'text-rose-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('paid')}
                        >
                            Payment History
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'paid' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {paidPayouts.length}
                            </span>
                            {activeTab === 'paid' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600 rounded-t-full"></div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    {activeTab === 'pending' ? (
                        pendingPayouts.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                                <p className="text-gray-500 mt-1">No pending payouts at the moment.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Info</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor Details</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount Breakdown</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pendingPayouts.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">#{booking.receiptNumber || booking._id.slice(-8)}</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(booking.createdAt)}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                        <User className="h-3 w-3" />
                                                        {booking.user?.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-xs">
                                                        {booking.vendor?.name?.charAt(0) || 'V'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{booking.vendor?.name}</p>
                                                        <p className="text-xs text-gray-500">{booking.vendor?.email}</p>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                            <Home className="h-3 w-3" />
                                                            {booking.farmhouse?.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>Total:</span>
                                                        <span>{formatCurrency(booking.totalPrice)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>Comm (5%):</span>
                                                        <span className="text-red-500">-{formatCurrency(booking.vendorPayout?.commissionAmount)}</span>
                                                    </div>
                                                    <div className="pt-1 border-t border-gray-100 flex justify-between items-center">
                                                        <span className="text-xs font-semibold text-gray-700">Payout:</span>
                                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(booking.vendorPayout?.amount)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDaysPending(booking.createdAt) > 7
                                                    ? 'bg-red-50 text-red-700 border border-red-100'
                                                    : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                    }`}>
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {getDaysPending(booking.createdAt)} days pending
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openModal(booking)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors shadow-sm"
                                                >
                                                    Mark Paid
                                                    <ArrowRight className="h-3 w-3 ml-1" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        paidPayouts.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No payment history</h3>
                                <p className="text-gray-500 mt-1">Processed payments will appear here.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking Info</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor Details</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount Paid</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Details</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Paid Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paidPayouts.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">#{booking.receiptNumber || booking._id.slice(-8)}</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <User className="h-3 w-3" />
                                                        {booking.user?.name || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-600 font-bold text-xs">
                                                        {booking.vendor?.name?.charAt(0) || 'V'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{booking.vendor?.name || 'N/A'}</p>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                            <Home className="h-3 w-3" />
                                                            {booking.farmhouse?.name || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-green-600">
                                                    {formatCurrency(booking.vendorPayout?.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-gray-900 uppercase">{booking.vendorPayout?.paymentMethod || 'N/A'}</span>
                                                    <span className="text-xs text-gray-500 font-mono mt-0.5">
                                                        Ref: {booking.vendorPayout?.transactionReference || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(booking.vendorPayout?.paidAt)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>

            {/* Mark as Paid Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Process Payout</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Summary Box */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-blue-700 font-medium">Amount to Pay</span>
                                    <span className="text-xl font-bold text-blue-900">{formatCurrency(selectedBooking.vendorPayout?.amount)}</span>
                                </div>
                                <div className="text-xs text-blue-600 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Vendor: {selectedBooking.vendor?.name}
                                </div>
                            </div>

                            {/* Vendor Bank Details */}
                            {selectedBooking.vendor?.payoutDetails && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor Bank Details</h4>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm space-y-2">
                                        {selectedBooking.vendor.payoutDetails.preferredMethod === 'bank_transfer' ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Bank Name</span>
                                                    <span className="font-medium text-gray-900">{selectedBooking.vendor.payoutDetails.bankName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Account No.</span>
                                                    <span className="font-medium text-gray-900 font-mono">{selectedBooking.vendor.payoutDetails.accountNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">IFSC Code</span>
                                                    <span className="font-medium text-gray-900 font-mono">{selectedBooking.vendor.payoutDetails.ifscCode}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">UPI ID</span>
                                                <span className="font-medium text-gray-900">{selectedBooking.vendor.payoutDetails.upiId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Form */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Method</label>
                                        <select
                                            value={paymentDetails.paymentMethod}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMethod: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        >
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="upi">UPI</option>
                                            <option value="cash">Cash</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Transaction Ref / UTR</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: UTR123456789"
                                            value={paymentDetails.transactionReference}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionReference: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                                    <textarea
                                        placeholder="Add any internal notes..."
                                        value={paymentDetails.notes}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, notes: e.target.value })}
                                        rows="2"
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkAsPaid}
                                disabled={!paymentDetails.transactionReference}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorPayouts;
