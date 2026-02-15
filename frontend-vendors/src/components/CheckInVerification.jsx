import React, { useState } from 'react';
import { Key, User, Phone, Mail, IndianRupee, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

const CheckInVerification = ({ onVerificationSuccess }) => {
    const [checkInCode, setCheckInCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifiedBooking, setVerifiedBooking] = useState(null);
    const [recordingPayment, setRecordingPayment] = useState(false);

    // Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!checkInCode.trim()) {
            toast.error('Please enter a check-in code');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('vendorToken');
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/bookings/verify-checkin`,
                { checkInCode: checkInCode.trim().toUpperCase() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setVerifiedBooking(res.data);
            toast.success('Check-in verified successfully!');
            if (onVerificationSuccess) {
                onVerificationSuccess(res.data.booking);
            }
        } catch (error) {
            console.error('Error verifying check-in:', error);
            toast.error(error.response?.data?.message || 'Failed to verify check-in code');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = () => {
        setIsConfirmModalOpen(true);
    };

    const performRecordPayment = async () => {
        if (!verifiedBooking?.booking?._id) return;

        try {
            setRecordingPayment(true);
            const token = localStorage.getItem('vendorToken');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/bookings/${verifiedBooking.booking._id}/balance-payment`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Balance payment recorded successfully!');
            setIsConfirmModalOpen(false);
            handleReset();
            if (onVerificationSuccess) {
                onVerificationSuccess();
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setRecordingPayment(false);
        }
    };

    const handleReset = () => {
        setCheckInCode('');
        setVerifiedBooking(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
                <div className="bg-emerald-100 p-3 rounded-xl mr-4">
                    <Key className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Check-in Verification</h2>
                    <p className="text-sm text-gray-600">Verify customer check-in code</p>
                </div>
            </div>

            {!verifiedBooking ? (
                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Check-in Code
                        </label>
                        <input
                            type="text"
                            value={checkInCode}
                            onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
                            placeholder="CHK123ABC"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-mono tracking-wider uppercase"
                            maxLength={9}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Verifying...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Verify Check-in
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    {/* Success Message */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center text-emerald-700 mb-2">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="font-semibold">Check-in Verified Successfully!</span>
                        </div>
                        <p className="text-sm text-emerald-600">
                            Customer has been checked in at {new Date(verifiedBooking.booking.checkInVerifiedAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Customer Details */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-bold text-gray-900 mb-4">Customer Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-700">
                                <User className="h-5 w-5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-semibold">{verifiedBooking.customer.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold">{verifiedBooking.customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-semibold">{verifiedBooking.customer.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Payment */}
                    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center text-yellow-800">
                                <IndianRupee className="h-5 w-5 mr-2" />
                                <span className="font-semibold">Balance Payment Due</span>
                            </div>
                            <span className="text-2xl font-bold text-yellow-900">
                                ₹{verifiedBooking.balancePayment.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-sm text-yellow-700 mb-4">
                            Customer must pay this amount at the property
                        </p>
                        <button
                            onClick={handleRecordPayment}
                            disabled={recordingPayment}
                            className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {recordingPayment ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Confirm Payment Received
                                </>
                            )}
                        </button>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                        <X className="h-5 w-5 mr-2" />
                        Verify Another Check-in
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={performRecordPayment}
                title="Confirm Payment"
                message={`Have you received the balance amount of ₹${verifiedBooking?.balancePayment?.toLocaleString()} from the guest?`}
                confirmText="Yes, Received"
                loading={recordingPayment}
            />
        </div>
    );
};

export default CheckInVerification;
