import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, Building2, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import vendorBg from '../assets/vendor-bg.png';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vendors/register`, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            login(res.data);
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vendors/google-auth`, {
                    access_token: tokenResponse.access_token
                });
                login(res.data);
                toast.success('Google registration successful!');
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || 'Google registration failed');
            }
        },
        onError: () => {
            console.log('Google Login Failed');
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
                            Join our community.
                        </h1>
                        <p className="text-xl text-emerald-100/90 font-medium leading-relaxed">
                            Start your journey as a host today. List your property, set your rules, and welcome guests from around the world.
                        </p>
                    </div>

                    <div className="text-emerald-200/60 text-sm font-medium">
                        © 2026 UtsavNest Partner Portal. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-14 bg-white overflow-y-auto">
                <div className="w-full max-w-[460px] py-8">
                    <div className="space-y-2 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                        <p className="text-gray-500 font-medium">Get started with your free partner account.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Custom Google Sign Up Button */}
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
                            <span className="text-gray-700 font-bold text-sm">Sign up with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                                <span className="px-6 bg-white text-gray-300">Or register with email</span>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                    </div>
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                        </div>
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                        </div>
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] mt-4"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <span className="flex items-center">
                                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
