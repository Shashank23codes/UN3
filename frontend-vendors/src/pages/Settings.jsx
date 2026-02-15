import React, { useState, useEffect } from 'react';
import { Lock, Bell, User, MapPin, Upload, Loader2, Camera, Shield, Key, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        about: '',
        street: '',
        city: '',
        state: '',
        zip: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Password Form State
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                about: user.about || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zip: user.address?.zip || ''
            });
            setImagePreview(user.profileImage);
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('vendorToken');
            const formData = new FormData();

            formData.append('name', profileData.name);
            formData.append('phone', profileData.phone);
            formData.append('about', profileData.about);

            const address = {
                street: profileData.street,
                city: profileData.city,
                state: profileData.state,
                zip: profileData.zip
            };
            formData.append('address', JSON.stringify(address));

            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/vendors/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            updateUser(res.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('vendorToken');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/vendors/change-password`, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Password updated successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-2 text-lg">Manage your profile details and security preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-8">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'profile'
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <User className={`h-5 w-5 mr-3 ${activeTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'security'
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Shield className={`h-5 w-5 mr-3 ${activeTab === 'security' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                Security & Password
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                <p className="text-gray-500 text-sm mt-1">Update your personal information and address</p>
                            </div>

                            <div className="p-6 md:p-8">
                                <form onSubmit={handleProfileUpdate} className="space-y-8">
                                    {/* Profile Image Section */}
                                    <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-100">
                                        <div className="relative group">
                                            <div className="h-28 w-28 rounded-full p-1 border-2 border-emerald-100 bg-white shadow-sm">
                                                <img
                                                    src={imagePreview || `https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`}
                                                    alt="Profile"
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            </div>
                                            <label className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-emerald-700 transition-colors transform hover:scale-105">
                                                <Camera className="h-4 w-4" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">Profile Photo</h3>
                                            <p className="text-sm text-gray-500 mt-1 max-w-xs">Upload a new photo to update your profile. Recommended size: 400x400px.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={profileData.name}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">About</label>
                                            <textarea
                                                name="about"
                                                value={profileData.about}
                                                onChange={handleProfileChange}
                                                rows="4"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white resize-none"
                                                placeholder="Tell us a bit about yourself and your business..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="p-1.5 bg-emerald-100 rounded-lg">
                                                <MapPin className="h-4 w-4 text-emerald-600" />
                                            </span>
                                            Address Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Street Address</label>
                                                <input
                                                    type="text"
                                                    name="street"
                                                    value={profileData.street}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={profileData.city}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={profileData.state}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Zip Code</label>
                                                <input
                                                    type="text"
                                                    name="zip"
                                                    value={profileData.zip}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 flex items-center transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                                <p className="text-gray-500 text-sm mt-1">Update your password and secure your account</p>
                            </div>

                            <div className="p-6 md:p-8">
                                <form onSubmit={handlePasswordUpdate} className="max-w-xl space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwords.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                required
                                            />
                                            <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">New Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwords.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                required
                                            />
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwords.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50/50 focus:bg-white"
                                                required
                                            />
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 flex items-center justify-center transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
