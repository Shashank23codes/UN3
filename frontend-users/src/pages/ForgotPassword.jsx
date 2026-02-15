import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/forgot-password`, { email });
            setEmailSent(true);
            toast.success('Password reset email sent!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600 mb-6">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            The link will expire in 1 hour. If you don't see the email, check your spam folder.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                        <p className="text-gray-600">
                            No worries! Enter your email and we'll send you reset instructions.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
