import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Settings, Percent, DollarSign, Shield, Mail, Bell,
    Save, Loader2, Check, AlertTriangle, ToggleLeft, ToggleRight,
    Clock, CreditCard, Building, User, Lock, Key
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const SystemSettings = () => {
    const { user, login } = useAuth(); // Assuming login updates context, or maybe we don't update context
    const [activeTab, setActiveTab] = useState('system');

    // System Settings State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        platformCommission: 10,
        minBookingHours: 24,
        maxAdvanceBookingDays: 90,
        cancellationDeadlineHours: 48,
        vendorPayoutPercentage: 90,
        autoApproveVendors: false,
        autoApproveFarmhouses: false,
        enableEmailNotifications: true,
        enablePushNotifications: true,
        maintenanceMode: false,
        allowGuestCheckout: false,
        minWithdrawalAmount: 1000,
        payoutProcessingDays: 7
    });

    // Account Settings State
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (user) {
            setProfile({ name: user.name, email: user.email });
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/settings`, config);
            setSettings(res.data);
        } catch (error) {
            console.error(error);
            // toast.error('Failed to load settings');
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/settings`, settings, config);
            toast.success('System settings saved successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
                name: profile.name,
                email: profile.email
            }, config);

            toast.success('Profile updated successfully');
            // Update context/local storage if needed? Admin usually refreshes on reload
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        setPasswordSaving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/change-password`, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }, config);

            toast.success('Password changed successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordSaving(false);
        }
    };

    const SettingCard = ({ title, description, children, icon: Icon, color }) => (
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                    <div className="mt-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );

    const Toggle = ({ enabled, onChange, label }) => (
        <button
            onClick={() => onChange(!enabled)}
            className="flex items-center gap-3"
        >
            {enabled ? (
                <ToggleRight className="h-8 w-8 text-indigo-600" />
            ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
            )}
            <span className={`text-sm font-medium ${enabled ? 'text-indigo-600' : 'text-gray-500'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
            </span>
        </button>
    );

    const NumberInput = ({ value, onChange, min, max, suffix, prefix }) => (
        <div className="flex items-center gap-2">
            {prefix && <span className="text-gray-500">{prefix}</span>}
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                min={min}
                max={max}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {suffix && <span className="text-gray-500">{suffix}</span>}
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage system configuration and account preferences</p>
                </div>

                {activeTab === 'system' && (
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Save System Changes
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('system')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'system'
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        System Configuration
                    </div>
                    {activeTab === 'system' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('account')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'account'
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Account Settings
                    </div>
                    {activeTab === 'account' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* System Configuration Tab */}
            {activeTab === 'system' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Financial Settings */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            Financial Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingCard
                                title="Platform Commission"
                                description="Percentage fee charged on each booking"
                                icon={Percent}
                                color="bg-gradient-to-br from-emerald-500 to-green-600"
                            >
                                <NumberInput
                                    value={settings.platformCommission}
                                    onChange={(v) => handleChange('platformCommission', v)}
                                    min={0}
                                    max={50}
                                    suffix="%"
                                />
                            </SettingCard>

                            <SettingCard
                                title="Vendor Payout Percentage"
                                description="Percentage of booking amount paid to vendors"
                                icon={CreditCard}
                                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                            >
                                <NumberInput
                                    value={settings.vendorPayoutPercentage}
                                    onChange={(v) => handleChange('vendorPayoutPercentage', v)}
                                    min={50}
                                    max={100}
                                    suffix="%"
                                />
                            </SettingCard>

                            <SettingCard
                                title="Minimum Withdrawal"
                                description="Minimum amount vendors can withdraw"
                                icon={DollarSign}
                                color="bg-gradient-to-br from-amber-500 to-orange-600"
                            >
                                <NumberInput
                                    value={settings.minWithdrawalAmount}
                                    onChange={(v) => handleChange('minWithdrawalAmount', v)}
                                    min={100}
                                    max={10000}
                                    prefix="₹"
                                />
                            </SettingCard>

                            <SettingCard
                                title="Payout Processing"
                                description="Days to process vendor payouts"
                                icon={Clock}
                                color="bg-gradient-to-br from-purple-500 to-violet-600"
                            >
                                <NumberInput
                                    value={settings.payoutProcessingDays}
                                    onChange={(v) => handleChange('payoutProcessingDays', v)}
                                    min={1}
                                    max={30}
                                    suffix="days"
                                />
                            </SettingCard>
                        </div>
                    </div>

                    {/* Booking Settings */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Booking Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingCard
                                title="Minimum Booking Lead Time"
                                description="Hours before check-in for new bookings"
                                icon={Clock}
                                color="bg-gradient-to-br from-cyan-500 to-blue-600"
                            >
                                <NumberInput
                                    value={settings.minBookingHours}
                                    onChange={(v) => handleChange('minBookingHours', v)}
                                    min={1}
                                    max={168}
                                    suffix="hours"
                                />
                            </SettingCard>

                            <SettingCard
                                title="Max Advance Booking"
                                description="How far in advance users can book"
                                icon={Clock}
                                color="bg-gradient-to-br from-teal-500 to-emerald-600"
                            >
                                <NumberInput
                                    value={settings.maxAdvanceBookingDays}
                                    onChange={(v) => handleChange('maxAdvanceBookingDays', v)}
                                    min={7}
                                    max={365}
                                    suffix="days"
                                />
                            </SettingCard>

                            <SettingCard
                                title="Cancellation Deadline"
                                description="Hours before check-in for free cancellation"
                                icon={AlertTriangle}
                                color="bg-gradient-to-br from-red-500 to-rose-600"
                            >
                                <NumberInput
                                    value={settings.cancellationDeadlineHours}
                                    onChange={(v) => handleChange('cancellationDeadlineHours', v)}
                                    min={12}
                                    max={168}
                                    suffix="hours"
                                />
                            </SettingCard>
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Settings className="h-5 w-5 text-indigo-600" />
                            Feature Toggles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingCard
                                title="Auto-Approve Vendors"
                                description="Automatically approve new vendor registrations"
                                icon={Shield}
                                color="bg-gradient-to-br from-indigo-500 to-purple-600"
                            >
                                <Toggle
                                    enabled={settings.autoApproveVendors}
                                    onChange={(v) => handleChange('autoApproveVendors', v)}
                                />
                            </SettingCard>

                            <SettingCard
                                title="Auto-Approve Farmhouses"
                                description="Automatically approve new property listings"
                                icon={Building}
                                color="bg-gradient-to-br from-pink-500 to-rose-600"
                            >
                                <Toggle
                                    enabled={settings.autoApproveFarmhouses}
                                    onChange={(v) => handleChange('autoApproveFarmhouses', v)}
                                />
                            </SettingCard>

                            <SettingCard
                                title="Email Notifications"
                                description="Send email notifications for events"
                                icon={Mail}
                                color="bg-gradient-to-br from-sky-500 to-blue-600"
                            >
                                <Toggle
                                    enabled={settings.enableEmailNotifications}
                                    onChange={(v) => handleChange('enableEmailNotifications', v)}
                                />
                            </SettingCard>

                            <SettingCard
                                title="Push Notifications"
                                description="Enable browser push notifications"
                                icon={Bell}
                                color="bg-gradient-to-br from-violet-500 to-purple-600"
                            >
                                <Toggle
                                    enabled={settings.enablePushNotifications}
                                    onChange={(v) => handleChange('enablePushNotifications', v)}
                                />
                            </SettingCard>

                            <SettingCard
                                title="Maintenance Mode"
                                description="Put the platform in maintenance mode"
                                icon={AlertTriangle}
                                color="bg-gradient-to-br from-amber-500 to-red-600"
                            >
                                <Toggle
                                    enabled={settings.maintenanceMode}
                                    onChange={(v) => handleChange('maintenanceMode', v)}
                                />
                                {settings.maintenanceMode && (
                                    <p className="text-amber-600 text-sm mt-2 font-medium">
                                        ⚠️ Platform is currently in maintenance mode
                                    </p>
                                )}
                            </SettingCard>

                            <SettingCard
                                title="Guest Checkout"
                                description="Allow booking without creating an account"
                                icon={User}
                                color="bg-gradient-to-br from-gray-500 to-gray-700"
                            >
                                <Toggle
                                    enabled={settings.allowGuestCheckout}
                                    onChange={(v) => handleChange('allowGuestCheckout', v)}
                                />
                            </SettingCard>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
                <div className="max-w-3xl space-y-8 animate-fadeIn">
                    <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            Profile Information
                        </h2>
                        <form onSubmit={updateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-rose-600" />
                            Change Password
                        </h2>
                        <form onSubmit={changePassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter current password"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passwordSaving}
                                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
