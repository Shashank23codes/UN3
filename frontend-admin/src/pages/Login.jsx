import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import loginBg from '../assets/login-bg.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password, secretKey);
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side: Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src={loginBg}
                    alt="Luxury Resort"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-rose-900/60 to-rose-950/80 backdrop-blur-[2px]"></div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                            <Home className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight">UtsavNest</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-6xl font-extrabold text-white leading-tight">
                            Join our community today.
                        </h1>
                        <p className="text-xl text-rose-100/90 font-medium leading-relaxed">
                            Manage exclusive stays and curate unforgettable experiences for travelers worldwide.
                        </p>
                    </div>

                    <div className="text-rose-200/60 text-sm font-medium">
                        © 2026 UtsavNest Admin Portal. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20">
                <div className="w-full max-w-[440px] space-y-10">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">Sign In</h2>
                        <p className="text-gray-500 font-medium">Please enter your admin credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-rose-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Admin Secret Key
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
                                </div>
                                <input
                                    type={showSecretKey ? "text" : "password"}
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all duration-200 sm:text-sm font-medium shadow-sm"
                                    placeholder="Enter your secret key"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecretKey(!showSecretKey)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-rose-600 transition-colors"
                                >
                                    {showSecretKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-rose-500/20 text-sm font-bold text-white bg-[#e30b5c] hover:bg-[#c4094f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="pt-6 text-center">
                        <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
                            <Shield className="h-3 w-3" />
                            Secure Admin-only Access Portal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
