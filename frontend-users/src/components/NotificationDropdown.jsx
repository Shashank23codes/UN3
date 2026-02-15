import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const NotificationDropdown = () => {
    const {
        notifications: contextNotifications,
        unreadCount,
        fetchNotifications: refreshNotifications
    } = useNotification();

    // Use top 5 notifications for dropdown
    const notifications = contextNotifications.slice(0, 5);

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Re-fetch when dropdown opens to ensure fresh data
    useEffect(() => {
        if (isOpen) {
            refreshNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('userToken');
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
            setLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            refreshNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification._id);
        setIsOpen(false);

        // Navigate based on notification type
        if (notification.data?.bookingId) {
            navigate('/trips');
        } else {
            navigate('/notifications');
        }
    };

    const getNotificationIcon = (type) => {
        const iconClass = "h-5 w-5";
        switch (type) {
            case 'booking_confirmed':
                return <CheckCheck className={`${iconClass} text-green-600`} />;
            case 'booking_rejected':
            case 'cancellation':
                return <X className={`${iconClass} text-red-600`} />;
            case 'check_in_verified':
                return <Check className={`${iconClass} text-blue-600`} />;
            default:
                return <Bell className={`${iconClass} text-gray-600`} />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-[32rem] overflow-hidden flex flex-col animate-fadeIn origin-top-right">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg transition"
                            >
                                {loading ? 'Marking...' : 'Mark all read'}
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1 bg-white">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-12 text-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-900">No new notifications</p>
                                <p className="text-sm mt-1">We'll notify you when something happens.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group relative ${!notification.read ? 'bg-rose-50/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 mt-1 p-1.5 rounded-lg ${!notification.read ? 'bg-rose-100/50' : 'bg-gray-100'}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1.5">
                                                    {getTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="flex-shrink-0 mt-2">
                                                    <div className="h-2 w-2 bg-rose-500 rounded-full shadow-sm animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/notifications');
                            }}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 w-full text-center transition py-1"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
