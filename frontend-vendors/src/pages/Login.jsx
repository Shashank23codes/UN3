import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import vendorBg from '../assets/vendor-bg.png';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vendors/login`, formData);
            login(res.data);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // If backend expects access token instead of id_token
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vendors/google-auth`, {
                    access_token: tokenResponse.access_token
                });
                login(res.data);
                toast.success('Google login successful!');
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || 'Google login failed');
            }
        },
        onError: () => {
            console.log('Login Failed');
            toast.error('Google Login Failed');
        },
    });

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side: Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src={vendorBg}
                    alt="Majestic Landscape"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 backdrop-blur-[2px]"></div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight">UtsavNest Partner</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-6xl font-extrabold text-white leading-tight">
                            Welcome back, Partner.
                        </h1>
                        <p className="text-xl text-emerald-100/90 font-medium leading-relaxed">
                            Manage your properties, track bookings, and grow your business with UtsavNest.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex-1 shadow-xl">
                                <div className="text-3xl font-bold text-white">500+</div>
                                <div className="text-emerald-100/80 text-sm mt-1 font-medium tracking-wide">Active Vendors</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex-1 shadow-xl">
                                <div className="text-3xl font-bold text-white">10k+</div>
                                <div className="text-emerald-100/80 text-sm mt-1 font-medium tracking-wide">Bookings</div>
                            </div>
                        </div>
                    </div>

                    <div className="text-emerald-200/60 text-sm font-medium">
                        © 2026 UtsavNest Partner Portal. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-white overflow-y-auto">
                <div className="w-full max-w-[420px] py-10">
                    <div className="space-y-2 mb-10">
                        <h2 className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">Sign In</h2>
                        <p className="text-gray-500 font-medium">Please enter your partner credentials to continue.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Custom Google Login Button */}
                        <button
                            onClick={() => googleLogin()}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                />
                            </svg>
                            <span className="text-gray-700 font-bold text-sm">Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                                <span className="px-6 bg-white text-gray-300">Or email credentials</span>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="block w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <span className="flex items-center">
                                        Sign In to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
