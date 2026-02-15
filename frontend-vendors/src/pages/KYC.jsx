import React, { useState, useEffect } from 'react';
import { CheckCircle, Building, Save, AlertCircle, Loader2, Lock, Shield, CreditCard, X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const KYC = () => {
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [saving, setSaving] = useState(false);

    // State for Payout Details
    const [payoutDetails, setPayoutDetails] = useState({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        preferredMethod: 'bank_transfer'
    });

    const [businessDetails, setBusinessDetails] = useState({
        name: '',
        type: 'individual',
        email: '',
        phone: '',
        pan: '',
        gst: ''
    });

    // State for Security
    const [isVerified, setIsVerified] = useState(false);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(`${API_URL}/api/vendors/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.payoutDetails) {
                setPayoutDetails(res.data.payoutDetails);
            }
            if (res.data.businessDetails) {
                setBusinessDetails(res.data.businessDetails);
            }
            setIsVerified(res.data.isVerified);
            setIsGoogleAuth(!!res.data.googleId);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch profile');
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        if (isGoogleAuth) {
            setIsEditing(true);
            toast.info('Identity verified via Google Account');
        } else {
            setShowPasswordModal(true);
        }
    };

    const handleVerifyPassword = async (e) => {
        e.preventDefault();
        setVerifying(true);
        try {
            const token = localStorage.getItem('vendorToken');
            await axios.post(
                `${API_URL}/api/vendors/verify-password`,
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsEditing(true);
            setShowPasswordModal(false);
            setPassword('');
            toast.success('Identity verified. You can now edit your details.');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Incorrect password');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('vendorToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await Promise.all([
                axios.put(`${API_URL}/api/vendors/payout-details`, payoutDetails, config),
                axios.put(`${API_URL}/api/vendors/business-details`, businessDetails, config)
            ]);

            toast.success('Account details updated successfully!');
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update details');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Account Verification</h1>
                <p className="text-gray-500 mt-2 text-lg">Manage your verification status and payout details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Status & Info */}
                <div className="space-y-6">
                    {/* Verification Status Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                            Account Status
                        </h3>

                        <div className={`p-4 rounded-xl border mb-4 flex items-start gap-3 ${isVerified
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-yellow-50 border-yellow-100'
                            }`}>
                            {isVerified ? (
                                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className={`font-bold ${isVerified ? 'text-emerald-800' : 'text-yellow-800'}`}>
                                    {isVerified ? 'Active & Verified' : 'Pending Verification'}
                                </h4>
                                <p className={`text-sm mt-1 ${isVerified ? 'text-emerald-600' : 'text-yellow-700'}`}>
                                    {isVerified
                                        ? 'Your account is active. You can receive payouts directly to your bank account.'
                                        : 'Your account is currently under review by the Admin. You can still update your payout details.'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Payout Method</span>
                                <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${payoutDetails.accountNumber || payoutDetails.upiId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {payoutDetails.accountNumber || payoutDetails.upiId ? 'Configured' : 'Missing'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Security Tip */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-900 flex items-center mb-2">
                            <Lock className="h-4 w-4 mr-2" />
                            Security Note
                        </h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            {isGoogleAuth
                                ? "Since you logged in with Google, your account is secured by your Google credentials."
                                : "To protect your earnings, you must verify your password before editing payout details. Never share your password or OTP with anyone."
                            }
                        </p>
                    </div>
                </div>

                {/* Right Column: Payout Form */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                                <p className="text-gray-500 text-sm mt-1">Update your business profile and payment methods</p>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={handleEditClick}
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center"
                                >
                                    <Lock className="h-4 w-4 mr-2 text-gray-400" />
                                    Edit Details
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Business Info Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                                {!isEditing && (
                                    <div className="absolute inset-0 bg-gray-50/30 z-10 cursor-not-allowed" />
                                )}
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        <Building className="h-5 w-5 mr-2 text-gray-500" />
                                        Business Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={businessDetails.name}
                                                onChange={(e) => setBusinessDetails({ ...businessDetails, name: e.target.value })}
                                                className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="Legal Business Name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Type</label>
                                            <select
                                                disabled={!isEditing}
                                                value={businessDetails.type}
                                                onChange={(e) => setBusinessDetails({ ...businessDetails, type: e.target.value })}
                                                className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                required
                                            >
                                                <option value="individual">Individual / Sole Proprietor</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="llp">LLP</option>
                                                <option value="private_limited">Private Limited</option>
                                                <option value="public_limited">Public Limited</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Email</label>
                                            <input
                                                type="email"
                                                disabled={!isEditing}
                                                value={businessDetails.email}
                                                onChange={(e) => setBusinessDetails({ ...businessDetails, email: e.target.value })}
                                                className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="official@business.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Phone</label>
                                            <input
                                                type="tel"
                                                disabled={!isEditing}
                                                value={businessDetails.phone}
                                                onChange={(e) => setBusinessDetails({ ...businessDetails, phone: e.target.value })}
                                                className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="+91 98765 43210"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">PAN Number</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={businessDetails.pan}
                                                onChange={(e) => setBusinessDetails({ ...businessDetails, pan: e.target.value.toUpperCase() })}
                                                className="input-field disabled:bg-gray-50 disabled:text-gray-500 uppercase"
                                                placeholder="ABCDE1234F"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST Number</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={businessDetails.gst}
                                                onChange={(e) => setBusinessDetails({ ...businessDetails, gst: e.target.value.toUpperCase() })}
                                                className="input-field disabled:bg-gray-50 disabled:text-gray-500 uppercase"
                                                placeholder="22ABCDE1234F1Z5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Info Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                                {!isEditing && (
                                    <div className="absolute inset-0 bg-gray-50/30 z-10 cursor-not-allowed" />
                                )}
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                                        Payout Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            Preferred Payout Method
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                disabled={!isEditing}
                                                onClick={() => setPayoutDetails({ ...payoutDetails, preferredMethod: 'bank_transfer' })}
                                                className={`p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${payoutDetails.preferredMethod === 'bank_transfer'
                                                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    } ${!isEditing ? 'opacity-70' : ''}`}
                                            >
                                                <div className={`p-3 rounded-full ${payoutDetails.preferredMethod === 'bank_transfer' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Building className="h-6 w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <span className={`block font-bold ${payoutDetails.preferredMethod === 'bank_transfer' ? 'text-emerald-900' : 'text-gray-700'}`}>Bank Transfer</span>
                                                    <span className="text-xs text-gray-500">Direct to bank account</span>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!isEditing}
                                                onClick={() => setPayoutDetails({ ...payoutDetails, preferredMethod: 'upi' })}
                                                className={`p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${payoutDetails.preferredMethod === 'upi'
                                                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    } ${!isEditing ? 'opacity-70' : ''}`}
                                            >
                                                <div className={`p-3 rounded-full ${payoutDetails.preferredMethod === 'upi' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <CreditCard className="h-6 w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <span className={`block font-bold ${payoutDetails.preferredMethod === 'upi' ? 'text-emerald-900' : 'text-gray-700'}`}>UPI Payment</span>
                                                    <span className="text-xs text-gray-500">Instant transfer via UPI</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {payoutDetails.preferredMethod === 'bank_transfer' && (
                                        <div className="space-y-5 animate-fadeIn">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank Name</label>
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        value={payoutDetails.bankName}
                                                        onChange={(e) => setPayoutDetails({ ...payoutDetails, bankName: e.target.value })}
                                                        className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                        placeholder="e.g., HDFC Bank"
                                                        required={payoutDetails.preferredMethod === 'bank_transfer'}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">IFSC Code</label>
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        value={payoutDetails.ifscCode}
                                                        onChange={(e) => setPayoutDetails({ ...payoutDetails, ifscCode: e.target.value.toUpperCase() })}
                                                        className="input-field disabled:bg-gray-50 disabled:text-gray-500 uppercase"
                                                        placeholder="e.g., HDFC0001234"
                                                        required={payoutDetails.preferredMethod === 'bank_transfer'}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Holder Name</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={payoutDetails.accountHolderName}
                                                    onChange={(e) => setPayoutDetails({ ...payoutDetails, accountHolderName: e.target.value })}
                                                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                    placeholder="Name as per bank records"
                                                    required={payoutDetails.preferredMethod === 'bank_transfer'}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={payoutDetails.accountNumber}
                                                    onChange={(e) => setPayoutDetails({ ...payoutDetails, accountNumber: e.target.value })}
                                                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                    placeholder="Enter account number"
                                                    required={payoutDetails.preferredMethod === 'bank_transfer'}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {payoutDetails.preferredMethod === 'upi' && (
                                        <div className="animate-fadeIn">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">UPI ID</label>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={payoutDetails.upiId}
                                                onChange={(e) => setPayoutDetails({ ...payoutDetails, upiId: e.target.value })}
                                                className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="e.g., username@okaxis"
                                                required={payoutDetails.preferredMethod === 'upi'}
                                            />
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-1 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-200"
                                            >
                                                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Password Verification Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Security Check</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleVerifyPassword} className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-600 mb-4 text-sm">
                                    For your security, please enter your password to edit payout details.
                                </p>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Enter your password"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!password || verifying}
                                    className="flex-1 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-lg shadow-emerald-200 flex justify-center items-center"
                                >
                                    {verifying ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify & Edit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KYC;
