import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    CreditCard,
    MapPin,
    Mail,
    Phone,
    ShieldCheck,
    CheckCircle,
    XCircle,
    User,
    Calendar,
    FileText,
    AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const VendorDetails = () => {
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendor();
    }, [id]);

    const fetchVendor = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/admin/vendors/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setVendor(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch vendor details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVerification = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/vendors/${id}/verify`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setVendor(prev => ({ ...prev, isVerified: res.data.isVerified }));
            toast.success(res.data.message);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update verification status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading vendor details...</p>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Vendor not found</h2>
                    <Link to="/vendors" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-flex items-center font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Vendors
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <Link to="/vendors" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors group">
                    <div className="p-1.5 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 mr-2 shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Vendors
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
                            {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-500">
                                <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-200 text-sm shadow-sm">
                                    <Mail className="h-3.5 w-3.5 text-indigo-500" />
                                    {vendor.email}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-200 text-sm shadow-sm">
                                    <Phone className="h-3.5 w-3.5 text-indigo-500" />
                                    {vendor.phone}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-200 text-sm shadow-sm">
                                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                    Joined {new Date(vendor.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {vendor.isVerified ? (
                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-700 border border-green-100 shadow-sm">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Verified Partner
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100 shadow-sm">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Verification Pending
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Admin Verification Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                Verification Status
                            </h2>
                        </div>
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${vendor.isVerified ? 'bg-green-100' : 'bg-orange-100'}`}>
                                        {vendor.isVerified ? (
                                            <CheckCircle className={`h-6 w-6 ${vendor.isVerified ? 'text-green-600' : 'text-orange-600'}`} />
                                        ) : (
                                            <AlertTriangle className={`h-6 w-6 ${vendor.isVerified ? 'text-green-600' : 'text-orange-600'}`} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {vendor.isVerified ? 'Vendor is Verified' : 'Vendor is Unverified'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                                            {vendor.isVerified
                                                ? 'This vendor has full access to list properties and receive bookings.'
                                                : 'This vendor requires verification before their listings can go live.'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {!vendor.isVerified && !vendor.phone && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm font-medium">
                                            <AlertTriangle className="h-4 w-4" />
                                            Vendor must provide a phone number before approval
                                        </div>
                                    )}
                                    <button
                                        onClick={handleToggleVerification}
                                        disabled={!vendor.isVerified && !vendor.phone}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg transform active:scale-95 ${vendor.isVerified
                                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                            : !vendor.phone
                                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                            }`}
                                    >
                                        {vendor.isVerified ? 'Revoke Verification' : 'Approve Vendor'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-indigo-600" />
                                Business Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Name</p>
                                    <p className="text-base font-medium text-gray-900">{vendor.businessDetails?.name || 'Not provided'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Type</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        <p className="text-base font-medium text-gray-900 capitalize">
                                            {vendor.businessDetails?.type?.replace('_', ' ') || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">PAN Number</p>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <p className="text-base font-medium text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded">
                                            {vendor.businessDetails?.pan || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GST Number</p>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <p className="text-base font-medium text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded">
                                            {vendor.businessDetails?.gst || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payout Information Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-indigo-600" />
                                Payout Information
                            </h2>
                            <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                                Provided by Vendor
                            </span>
                        </div>
                        <div className="p-6">
                            {vendor.payoutDetails?.preferredMethod === 'bank_transfer' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bank Name</p>
                                        <p className="text-sm font-bold text-gray-900">{vendor.payoutDetails?.bankName || '-'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Holder</p>
                                        <p className="text-sm font-bold text-gray-900">{vendor.payoutDetails?.accountHolderName || '-'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Number</p>
                                        <p className="text-sm font-bold text-gray-900 font-mono tracking-wide">
                                            {vendor.payoutDetails?.accountNumber || '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">IFSC Code</p>
                                        <p className="text-sm font-bold text-gray-900 font-mono tracking-wide">{vendor.payoutDetails?.ifscCode || '-'}</p>
                                    </div>
                                </div>
                            ) : vendor.payoutDetails?.preferredMethod === 'upi' ? (
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <CreditCard className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">UPI ID</p>
                                        <p className="text-lg font-bold text-gray-900">{vendor.payoutDetails?.upiId || '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500">No payout details provided yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Mail className="h-5 w-5 text-indigo-600" />
                                Contact Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm font-medium text-gray-900 mt-0.5">{vendor.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</p>
                                    <p className="text-sm font-medium text-gray-900 mt-0.5">{vendor.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-indigo-600" />
                                Address
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 flex-shrink-0">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                    <span className="block font-medium text-gray-900 mb-1">Registered Address</span>
                                    {vendor.address?.street}<br />
                                    {vendor.address?.city}, {vendor.address?.state}<br />
                                    {vendor.address?.zip}
                                </address>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDetails;
