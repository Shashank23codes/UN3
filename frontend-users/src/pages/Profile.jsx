import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Camera, Loader2, Save, Star, Calendar, MapPin, LogOut, ChevronRight, Settings, Shield, Edit2, X, Phone } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setPreviewImage(user.picture);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchUserReviews();
        }
    }, [activeTab]);

    const fetchUserReviews = async () => {
        setLoadingReviews(true);
        try {
            const token = localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/my-reviews`, config);
            setReviews(res.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load your reviews');
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('userToken');
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            if (password) formData.append('password', password);
            if (selectedImage) formData.append('picture', selectedImage);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data } = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/users/profile`,
                formData,
                config
            );

            login(data);
            toast.success('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
            setIsEditing(false);
            setSelectedImage(null);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel editing: reset fields
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setPreviewImage(user.picture);
            setSelectedImage(null);
            setPassword('');
            setConfirmPassword('');
        }
        setIsEditing(!isEditing);
    };

    if (!user) return null;

    return (
        <div className="pt-28 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
                        <p className="text-gray-600">Manage your profile, security, and view your activity</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
                                <div className="relative mb-4 group">
                                    <div className="h-24 w-24 rounded-full bg-gray-100 p-1 shadow-inner overflow-hidden relative">
                                        <img
                                            src={previewImage || 'https://via.placeholder.com/150'}
                                            alt={user.name}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                        {isEditing && (
                                            <div
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Camera className="h-8 w-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 bg-rose-600 text-white p-2 rounded-full hover:bg-rose-700 transition-colors shadow-md"
                                            title="Change photo"
                                        >
                                            <Camera className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>
                            <nav className="p-2">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'general'
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <User className="h-5 w-5" />
                                    <span>General Information</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'security'
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Shield className="h-5 w-5" />
                                    <span>Security</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'reviews'
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Star className="h-5 w-5" />
                                    <span>My Reviews</span>
                                </button>
                                <Link
                                    to="/trips"
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    <Calendar className="h-5 w-5" />
                                    <span>My Trips</span>
                                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                                </Link>
                                <div className="my-2 border-t border-gray-100"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Log Out</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">

                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">General Information</h2>
                                            <p className="text-gray-500 text-sm">Update your personal details</p>
                                        </div>
                                        <button
                                            onClick={toggleEdit}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isEditing
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                }`}
                                        >
                                            {isEditing ? (
                                                <>
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </>
                                            ) : (
                                                <>
                                                    <Edit2 className="h-4 w-4" />
                                                    Edit Profile
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl transition-colors ${isEditing
                                                        ? 'border-gray-300 focus:ring-rose-500 focus:border-rose-500'
                                                        : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    disabled={!isEditing}
                                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl transition-colors ${isEditing
                                                        ? 'border-gray-300 focus:ring-rose-500 focus:border-rose-500'
                                                        : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="+91 1234567890"
                                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl transition-colors ${isEditing
                                                        ? 'border-gray-300 focus:ring-rose-500 focus:border-rose-500'
                                                        : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-70 w-full sm:w-auto"
                                                >
                                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="p-8">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Security</h2>
                                        <p className="text-gray-500 text-sm">Manage your password and account security</p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-70"
                                            >
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* My Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="p-8">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">My Reviews</h2>
                                        <p className="text-gray-500 text-sm">Reviews you've written for farmhouses</p>
                                    </div>

                                    {loadingReviews ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                                        </div>
                                    ) : reviews.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <h3 className="text-gray-900 font-medium mb-1">No reviews yet</h3>
                                            <p className="text-gray-500 text-sm mb-4">You haven't written any reviews yet.</p>
                                            <Link to="/trips" className="text-rose-600 font-semibold hover:underline">
                                                Go to Trips to review a stay
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {reviews.map((review) => (
                                                <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                                                                <img
                                                                    src={review.farmhouse?.images?.[0] || 'https://via.placeholder.com/100'}
                                                                    alt={review.farmhouse?.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Link to={`/farmhouses/${review.farmhouse?._id}`} className="font-bold text-gray-900 hover:text-rose-600 transition-colors">
                                                                    {review.farmhouse?.name || 'Unknown Farmhouse'}
                                                                </Link>
                                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                                    <Calendar className="h-3 w-3 mr-1" />
                                                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                                            <span className="font-bold text-yellow-700">{review.rating}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                                        "{review.comment}"
                                                    </p>

                                                    {/* Categories */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {Object.entries(review.categories || {}).map(([key, value]) => (
                                                            <div key={key} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-1.5 rounded-lg">
                                                                <span className="text-gray-500 capitalize">{key}</span>
                                                                <span className="font-medium text-gray-900">{value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
