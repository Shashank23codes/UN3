import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { vendor } = useAuth();
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    // In-app notification state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Check notification permission status on mount and whenever vendor changes
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
            console.log('🔔 [Vendor] Notification permission status:', Notification.permission);

            // ALWAYS show permission modal to logged-in vendors who haven't granted permission
            if (vendor && Notification.permission === 'default') {
                const timer = setTimeout(() => {
                    console.log('📢 [Vendor] Showing notification permission modal');
                    setShowPermissionModal(true);
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            console.error('❌ [Vendor] This browser does not support notifications');
        }
    }, [vendor]);

    // Fetch in-app notifications
    const fetchNotifications = async () => {
        if (!vendor) return;

        try {
            const token = localStorage.getItem('vendorToken');
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notifications`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.notifications.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Poll for notifications every 30 seconds
    useEffect(() => {
        if (vendor) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [vendor]);

    // Request notification permission
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            console.error('❌ [Vendor] This browser does not support notifications');
            alert('Your browser does not support notifications. Please use Chrome, Firefox, or Edge.');
            return false;
        }

        try {
            console.log('🔔 [Vendor] Requesting notification permission...');
            const permission = await Notification.requestPermission();
            console.log('🔔 [Vendor] Permission result:', permission);

            setNotificationPermission(permission);
            setShowPermissionModal(false);

            if (permission === 'granted') {
                console.log('✅ [Vendor] Notification permission granted!');
                setTimeout(() => {
                    sendNotification({
                        title: '🎉 Notifications Enabled!',
                        body: 'You will now receive important updates about your bookings and payouts.',
                        icon: '/favicon.ico',
                    });
                }, 500);
            } else if (permission === 'denied') {
                console.warn('⛔ [Vendor] Notification permission denied');
                alert('Notifications blocked. To enable:\n1. Click the lock icon in address bar\n2. Find "Notifications"\n3. Change to "Allow"\n4. Refresh the page');
            }

            return permission === 'granted';
        } catch (error) {
            console.error('❌ [Vendor] Error requesting notification permission:', error);
            return false;
        }
    };

    // Decline permission
    const declinePermission = () => {
        console.log('❌ [Vendor] User declined notification permission');
        setShowPermissionModal(false);
    };

    // Send a notification
    const sendNotification = ({ title, body, icon, tag, data, onClick }) => {
        console.log('🔔 [Vendor] Attempting to send notification:', { title, body, permission: Notification.permission });

        if (Notification.permission !== 'granted') {
            console.warn('⚠️ [Vendor] Notification permission not granted. Current permission:', Notification.permission);
            return null;
        }

        try {
            console.log('✅ [Vendor] Creating notification...');
            const notification = new Notification(title, {
                body,
                icon: icon || '/favicon.ico',
                badge: '/favicon.ico',
                tag: tag || 'default',
                data: data || {},
                requireInteraction: false,
                silent: false,
            });

            console.log('✅ [Vendor] Notification created successfully!');

            if (onClick) {
                notification.onclick = (event) => {
                    console.log('🖱️ [Vendor] Notification clicked');
                    event.preventDefault();
                    window.focus();
                    onClick(event);
                    notification.close();
                };
            } else {
                notification.onclick = (event) => {
                    console.log('🖱️ [Vendor] Notification clicked (default)');
                    event.preventDefault();
                    window.focus();
                    notification.close();
                };
            }

            notification.onshow = () => console.log('✅ [Vendor] Notification shown!');
            notification.onerror = (e) => console.error('❌ [Vendor] Notification error:', e);
            notification.onclose = () => console.log('🔕 [Vendor] Notification closed');

            setTimeout(() => notification.close(), 10000);

            // Refresh in-app notifications
            fetchNotifications();

            return notification;
        } catch (error) {
            console.error('❌ [Vendor] Error sending notification:', error);
            alert('Failed to create notification. Error: ' + error.message);
            return null;
        }
    };

    // Predefined notification types for vendor events
    const notificationTypes = {
        newBooking: (bookingDetails) => {
            sendNotification({
                title: '🎉 New Booking Request!',
                body: `${bookingDetails.guestName} wants to book ${bookingDetails.farmhouseName} for ${bookingDetails.checkIn}`,
                tag: 'new-booking',
                data: { bookingId: bookingDetails.id, type: 'booking' },
                onClick: () => {
                    window.location.href = `/bookings/${bookingDetails.id}`;
                },
            });
        },

        bookingConfirmed: (bookingDetails) => {
            sendNotification({
                title: '✅ Booking Confirmed',
                body: `Booking #${bookingDetails.receiptNumber} has been confirmed for ${bookingDetails.farmhouseName}`,
                tag: 'booking-confirmed',
                data: { bookingId: bookingDetails.id, type: 'booking' },
                onClick: () => {
                    window.location.href = `/bookings/${bookingDetails.id}`;
                },
            });
        },

        bookingCancelled: (bookingDetails) => {
            sendNotification({
                title: '⚠️ Booking Cancelled',
                body: `Booking for ${bookingDetails.farmhouseName} has been cancelled`,
                tag: 'booking-cancelled',
                data: { bookingId: bookingDetails.id, type: 'cancellation' },
                onClick: () => {
                    window.location.href = `/bookings/${bookingDetails.id}`;
                },
            });
        },

        paymentReceived: (amount) => {
            sendNotification({
                title: '💰 Payment Received',
                body: `You received ₹${amount} from a guest`,
                tag: 'payment-received',
                data: { type: 'payment' },
                onClick: () => {
                    window.location.href = '/payouts';
                },
            });
        },

        payoutProcessed: (amount) => {
            sendNotification({
                title: '💸 Payout Processed',
                body: `₹${amount} has been transferred to your account`,
                tag: 'payout-processed',
                data: { type: 'payout' },
                onClick: () => {
                    window.location.href = '/payouts';
                },
            });
        },

        checkInReminder: (bookingDetails) => {
            sendNotification({
                title: '📅 Guest Check-in Today',
                body: `${bookingDetails.guestName} is checking in today at ${bookingDetails.farmhouseName}`,
                tag: 'checkin-reminder',
                data: { bookingId: bookingDetails.id, type: 'reminder' },
                onClick: () => {
                    window.location.href = `/bookings/${bookingDetails.id}`;
                },
            });
        },

        newReview: (reviewDetails) => {
            sendNotification({
                title: '⭐ New Review!',
                body: `${reviewDetails.guestName} left a ${reviewDetails.rating}-star review for ${reviewDetails.farmhouseName}`,
                tag: 'new-review',
                data: { farmhouseId: reviewDetails.farmhouseId, type: 'review' },
                onClick: () => {
                    window.location.href = `/farmhouses/${reviewDetails.farmhouseId}`;
                },
            });
        },

        kycUpdate: (status) => {
            const titles = {
                pending: '📋 KYC Submitted',
                activated: '✅ KYC Approved',
                rejected: '❌ KYC Rejected',
            };
            const messages = {
                pending: 'Your KYC documents are under review',
                activated: 'Your account is now verified! You can start receiving payouts.',
                rejected: 'Please update your KYC documents and try again',
            };

            sendNotification({
                title: titles[status] || '📋 KYC Update',
                body: messages[status] || 'Your KYC status has been updated',
                tag: 'kyc-update',
                data: { type: 'kyc' },
                onClick: () => {
                    window.location.href = '/kyc';
                },
            });
        },

        generalUpdate: (title, message) => {
            sendNotification({
                title: title,
                body: message,
                tag: 'general',
                data: { type: 'general' },
            });
        },
    };

    const value = {
        notificationPermission,
        showPermissionModal,
        requestPermission,
        declinePermission,
        sendNotification,
        notifications,
        unreadCount,
        fetchNotifications,
        setNotifications,
        setUnreadCount,
        ...notificationTypes,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
