import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, User, Mail, Phone, Users, Calendar, MapPin, AlertCircle, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const bookingData = location.state?.bookingData;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        guestName: user?.name || '',
        guestEmail: user?.email || '',
        guestPhone: user?.phone || '',
        numberOfGuests: bookingData?.numberOfGuests || 1,
        specialRequests: ''
    });

    useEffect(() => {
        if (!bookingData) {
            toast.error('No booking data found');
            navigate('/');
        }
    }, [bookingData, navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Create booking
            const bookingPayload = {
                farmhouse: bookingData.farmhouseId,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                numberOfGuests: formData.numberOfGuests,
                totalPrice: bookingData.totalPrice,
                guestDetails: {
                    name: formData.guestName,
                    email: formData.guestEmail,
                    phone: formData.guestPhone,
                    specialRequests: formData.specialRequests
                }
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/bookings`,
                bookingPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Initialize Razorpay payment
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: Math.round(bookingData.totalPrice * 0.30) * 100, // Convert to paise (30% advance)
                currency: 'INR',
                name: 'UtsavNest',
                description: `Booking for ${bookingData.farmhouseName}`,
                order_id: response.data.razorpayOrderId,
                handler: async function (razorpayResponse) {
                    try {
                        // Verify payment
                        await axios.post(
                            `${import.meta.env.VITE_API_URL}/api/payments/verify`,
                            {
                                razorpay_order_id: razorpayResponse.razorpay_order_id,
                                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                                razorpay_signature: razorpayResponse.razorpay_signature,
                                bookingId: response.data.booking._id
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        toast.success('Booking confirmed!');
                        navigate('/booking-confirmation', {
                            state: { bookingId: response.data.booking._id }
                        });
                    } catch (error) {
                        toast.error('Payment verification failed');
                        console.error(error);
                    }
                },
                prefill: {
                    name: formData.guestName,
                    email: formData.guestEmail,
                    contact: formData.guestPhone
                },
                theme: {
                    color: '#10b981'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!bookingData) return null;

    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
                    <p className="text-gray-600 mt-2">Just a few more details and you're all set!</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-emerald-100 p-2 rounded-lg">
                                    <User className="h-5 w-5 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Guest Information</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="guestName"
                                        value={formData.guestName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="guestEmail"
                                            value={formData.guestEmail}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="guestPhone"
                                            value={formData.guestPhone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="+91 1234567890"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Guests *
                                    </label>
                                    <input
                                        type="number"
                                        name="numberOfGuests"
                                        value={formData.numberOfGuests}
                                        onChange={handleInputChange}
                                        min="1"
                                        max={bookingData.maxGuests || 10}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        name="specialRequests"
                                        value={formData.specialRequests}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Any special requirements or requests..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-amber-900 mb-2">Cancellation Policy</h3>
                                    <p className="text-sm text-amber-800">
                                        Free cancellation up to 48 hours before check-in. After that, 50% of the booking amount will be charged.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>

                            {/* Farmhouse Info */}
                            <div className="mb-6">
                                {bookingData.farmhouseImage && (
                                    <img
                                        src={bookingData.farmhouseImage}
                                        alt={bookingData.farmhouseName}
                                        className="w-full h-40 object-cover rounded-lg mb-4"
                                    />
                                )}
                                <h3 className="font-semibold text-gray-900">{bookingData.farmhouseName}</h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {bookingData.location}
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Check-in
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(bookingData.checkIn).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Check-out
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(bookingData.checkOut).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Guests
                                    </span>
                                    <span className="font-medium text-gray-900">{formData.numberOfGuests}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Price</span>
                                    <span className="text-gray-900">₹{bookingData.totalPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                                    <span>Pay Now (30%)</span>
                                    <span>₹{Math.round(bookingData.totalPrice * 0.30)?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 px-2">
                                    <span>Pay at Check-in (70%)</span>
                                    <span>₹{Math.round(bookingData.totalPrice * 0.70)?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Amount to Pay</span>
                                    <span className="text-2xl font-bold text-emerald-600">
                                        ₹{Math.round(bookingData.totalPrice * 0.30)?.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading || !formData.guestName || !formData.guestEmail || !formData.guestPhone}
                                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5" />
                                        Pay ₹{Math.round(bookingData.totalPrice * 0.30)?.toLocaleString()} & Book
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Secure payment powered by Razorpay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
