import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, Trash2, Loader2, Calendar, DollarSign, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Notifications = () => {
    const {
        notifications: contextNotifications,
        fetchNotifications: refreshNotifications,
        notificationPermission,
        requestPermission
    } = useNotification();

    const [filter, setFilter] = useState('all'); // all, unread, read
    const navigate = useNavigate();

    // Use context notifications
    const notifications = contextNotifications;

    useEffect(() => {
        refreshNotifications();
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('vendorToken');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refreshNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('vendorToken');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('All notifications marked as read');
            refreshNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;

        try {
            const token = localStorage.getItem('vendorToken');
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Notification deleted');
            refreshNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigate based on notification type
        if (notification.data?.bookingId) {
            navigate(`/dashboard/bookings`);
        } else if (notification.data?.type === 'payout' || notification.data?.type === 'payment') {
            navigate('/dashboard/payouts');
        } else if (notification.data?.type === 'kyc') {
            navigate('/dashboard/kyc');
        }
    };

    const getNotificationIcon = (type) => {
        const iconClass = "h-6 w-6";
        switch (type) {
            case 'new_booking':
                return <Bell className={`${iconClass} text-blue-600`} />;
            case 'booking_cancelled':
                return <X className={`${iconClass} text-red-600`} />;
            case 'payment_received':
            case 'payout_processed':
                return <DollarSign className={`${iconClass} text-green-600`} />;
            case 'kyc_update':
                return <Shield className={`${iconClass} text-purple-600`} />;
            default:
                return <Bell className={`${iconClass} text-gray-600`} />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return new Date(date).toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    return (
        <div className="max-w-5xl mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
                    <p className="text-gray-500 mt-1">Updates on bookings, payments, and account status</p>
                </div>

                {/* Notification Settings Card - Mini */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-full ${notificationPermission === 'granted' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            Browser Notifications
                        </p>
                        <p className="text-xs text-gray-500">
                            {notificationPermission === 'granted' ? 'Active & Running' : 'Disabled'}
                        </p>
                    </div>
                    {notificationPermission !== 'granted' && (
                        <button
                            onClick={requestPermission}
                            className="ml-auto text-xs font-semibold bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition"
                        >
                            Enable
                        </button>
                    )}
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-100/50 p-1 rounded-xl w-full sm:w-auto">
                    {['all', 'unread', 'read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${filter === f
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            {f}
                            <span className="ml-2 text-xs opacity-60 bg-gray-200 px-1.5 py-0.5 rounded-full">
                                {f === 'all' ? notifications.length : notifications.filter(n => f === 'unread' ? !n.read : n.read).length}
                            </span>
                        </button>
                    ))}
                </div>

                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors w-full sm:w-auto justify-center"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {filter === 'unread'
                            ? "You have no unread notifications. Great job!"
                            : "No notifications to display at the moment."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-md ${!notification.read
                                    ? 'border-emerald-200 bg-emerald-50/10 shadow-sm'
                                    : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div className="p-5 flex items-start gap-4">
                                <div className={`flex-shrink-0 mt-1 p-2 rounded-xl ${!notification.read ? 'bg-emerald-100/50' : 'bg-gray-100'}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className={`text-base font-semibold mb-1 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                                            {getTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 sm:static sm:opacity-100">
                                    {!notification.read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification._id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                            title="Mark Read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {!notification.read && (
                                <div className="absolute left-0 top-6 bottom-6 w-1 bg-emerald-500 rounded-r-full" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
