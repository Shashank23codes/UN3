import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    // In-app notification state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Check notification permission status on mount
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
            console.log('🔔 [Admin] Notification permission status:', Notification.permission);

            // ALWAYS show permission modal to logged-in admins who haven't granted permission
            if (isAuthenticated && Notification.permission === 'default') {
                const timer = setTimeout(() => {
                    console.log('📢 [Admin] Showing notification permission modal');
                    setShowPermissionModal(true);
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            console.error('❌ [Admin] This browser does not support notifications');
        }
    }, [isAuthenticated]);

    // Fetch in-app notifications
    const fetchNotifications = async () => {
        if (!isAuthenticated) return;

        try {
            const token = localStorage.getItem('adminToken');
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

    // Poll for notifications every minute
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Request notification permission
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            console.error('❌ [Admin] This browser does not support notifications');
            alert('Your browser does not support notifications. Please use Chrome, Firefox, or Edge.');
            return false;
        }

        try {
            console.log('🔔 [Admin] Requesting notification permission...');
            const permission = await Notification.requestPermission();
            console.log('🔔 [Admin] Permission result:', permission);

            setNotificationPermission(permission);
            setShowPermissionModal(false);

            if (permission === 'granted') {
                console.log('✅ [Admin] Notification permission granted!');
                setTimeout(() => {
                    sendNotification({
                        title: '🎉 Notifications Enabled!',
                        body: 'You will now receive important admin alerts and updates.',
                        icon: '/favicon.ico',
                    });
                }, 500);
            } else if (permission === 'denied') {
                console.warn('⛔ [Admin] Notification permission denied');
                alert('Notifications blocked. To enable:\n1. Click the lock icon in address bar\n2. Find "Notifications"\n3. Change to "Allow"\n4. Refresh the page');
            }

            return permission === 'granted';
        } catch (error) {
            console.error('❌ [Admin] Error requesting notification permission:', error);
            return false;
        }
    };

    // Decline permission
    const declinePermission = () => {
        console.log('❌ [Admin] User declined notification permission');
        setShowPermissionModal(false);
    };

    // Send a browser notification
    const sendNotification = ({ title, body, icon, tag, data, onClick }) => {
        console.log('🔔 [Admin] Attempting to send notification:', { title, body, permission: Notification.permission });

        if (Notification.permission !== 'granted') {
            console.warn('⚠️ [Admin] Notification permission not granted. Current permission:', Notification.permission);
            return null;
        }

        try {
            console.log('✅ [Admin] Creating notification...');
            const notification = new Notification(title, {
                body,
                icon: icon || '/favicon.ico',
                badge: '/favicon.ico',
                tag: tag || 'default',
                data: data || {},
                requireInteraction: false,
                silent: false,
            });

            console.log('✅ [Admin] Notification created successfully!');

            if (onClick) {
                notification.onclick = (event) => {
                    console.log('🖱️ [Admin] Notification clicked');
                    event.preventDefault();
                    window.focus();
                    onClick(event);
                    notification.close();
                };
            } else {
                notification.onclick = (event) => {
                    console.log('🖱️ [Admin] Notification clicked (default)');
                    event.preventDefault();
                    window.focus();
                    notification.close();
                };
            }

            notification.onshow = () => console.log('✅ [Admin] Notification shown!');
            notification.onerror = (e) => console.error('❌ [Admin] Notification error:', e);
            notification.onclose = () => console.log('🔕 [Admin] Notification closed');

            setTimeout(() => notification.close(), 10000);

            // Also refresh in-app notifications
            fetchNotifications();

            return notification;
        } catch (error) {
            console.error('❌ [Admin] Error sending notification:', error);
            return null;
        }
    };

    // Predefined notification types for admin events
    const notificationTypes = {
        newVendorRegistration: (vendorDetails) => {
            sendNotification({
                title: '👤 New Vendor Registration',
                body: `${vendorDetails.name} has registered and is pending verification`,
                tag: 'new-vendor',
                data: { vendorId: vendorDetails.id, type: 'vendor' },
                onClick: () => {
                    window.location.href = `/vendors/${vendorDetails.id}`;
                },
            });
        },

        newUserRegistration: (userDetails) => {
            sendNotification({
                title: '👥 New User Registered',
                body: `${userDetails.name} (${userDetails.email}) has joined the platform`,
                tag: 'new-user',
                data: { userId: userDetails.id, type: 'user' },
                onClick: () => {
                    window.location.href = `/users/${userDetails.id}`;
                },
            });
        },

        newBooking: (bookingDetails) => {
            sendNotification({
                title: '📅 New Booking Created',
                body: `${bookingDetails.userName} booked ${bookingDetails.farmhouseName}`,
                tag: 'new-booking',
                data: { bookingId: bookingDetails.id, type: 'booking' },
                onClick: () => {
                    window.location.href = '/bookings';
                },
            });
        },

        vendorKYCSubmitted: (vendorDetails) => {
            sendNotification({
                title: '📋 KYC Documents Submitted',
                body: `${vendorDetails.name} submitted KYC documents for review`,
                tag: 'kyc-submitted',
                data: { vendorId: vendorDetails.id, type: 'kyc' },
                onClick: () => {
                    window.location.href = `/vendors/${vendorDetails.id}`;
                },
            });
        },

        paymentReceived: (paymentDetails) => {
            sendNotification({
                title: '💰 Payment Received',
                body: `₹${paymentDetails.amount} received from ${paymentDetails.userName}`,
                tag: 'payment-received',
                data: { type: 'payment' },
                onClick: () => {
                    window.location.href = '/earnings';
                },
            });
        },

        payoutRequested: (payoutDetails) => {
            sendNotification({
                title: '💸 Payout Requested',
                body: `${payoutDetails.vendorName} requested payout of ₹${payoutDetails.amount}`,
                tag: 'payout-requested',
                data: { vendorId: payoutDetails.vendorId, type: 'payout' },
                onClick: () => {
                    window.location.href = '/payouts';
                },
            });
        },

        bookingCancellation: (bookingDetails) => {
            sendNotification({
                title: '⚠️ Booking Cancelled',
                body: `Booking #${bookingDetails.receiptNumber} was cancelled`,
                tag: 'booking-cancelled',
                data: { bookingId: bookingDetails.id, type: 'cancellation' },
                onClick: () => {
                    window.location.href = '/bookings';
                },
            });
        },

        vendorVerificationPending: (vendorDetails) => {
            sendNotification({
                title: '⏳ Vendor Verification Required',
                body: `${vendorDetails.name}'s account needs admin verification`,
                tag: 'verification-pending',
                data: { vendorId: vendorDetails.id, type: 'verification' },
                onClick: () => {
                    window.location.href = `/vendors/${vendorDetails.id}`;
                },
            });
        },

        disputeReported: (disputeDetails) => {
            sendNotification({
                title: '🚨 Dispute Reported',
                body: `${disputeDetails.reporterName} reported an issue`,
                tag: 'dispute',
                data: { disputeId: disputeDetails.id, type: 'dispute' },
                onClick: () => {
                    window.location.href = '/bookings';
                },
            });
        },

        systemAlert: (alertDetails) => {
            sendNotification({
                title: alertDetails.severity === 'high' ? '🚨 Critical Alert' : '⚠️ System Alert',
                body: alertDetails.message,
                tag: 'system-alert',
                data: { type: 'system', severity: alertDetails.severity },
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
