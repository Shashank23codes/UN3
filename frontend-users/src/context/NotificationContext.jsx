import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    // In-app notification state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Check notification permission status on mount and whenever user changes
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
            console.log('🔔 Notification permission status:', Notification.permission);

            // ALWAYS show permission modal to logged-in users who haven't granted permission
            if (user && Notification.permission === 'default') {
                // Show modal after 3 seconds
                const timer = setTimeout(() => {
                    console.log('📢 Showing notification permission modal');
                    setShowPermissionModal(true);
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            console.error('❌ This browser does not support notifications');
        }
    }, [user]);

    // Fetch in-app notifications
    const fetchNotifications = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem('userToken');
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
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Request notification permission
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            console.error('❌ This browser does not support notifications');
            alert('Your browser does not support notifications. Please use Chrome, Firefox, or Edge.');
            return false;
        }

        try {
            console.log('🔔 Requesting notification permission...');
            const permission = await Notification.requestPermission();
            console.log('🔔 Permission result:', permission);

            setNotificationPermission(permission);
            setShowPermissionModal(false);

            if (permission === 'granted') {
                console.log('✅ Notification permission granted!');
                // Send a welcome notification immediately
                setTimeout(() => {
                    sendNotification({
                        title: '🎉 Notifications Enabled!',
                        body: 'You will now receive important updates about your bookings.',
                        icon: '/favicon.ico',
                    });
                }, 500);
            } else if (permission === 'denied') {
                console.warn('⛔ Notification permission denied');
                alert('Notifications blocked. To enable:\n1. Click the lock icon in address bar\n2. Find "Notifications"\n3. Change to "Allow"\n4. Refresh the page');
            }

            return permission === 'granted';
        } catch (error) {
            console.error('❌ Error requesting notification permission:', error);
            return false;
        }
    };

    // Decline permission
    const declinePermission = () => {
        console.log('❌ User declined notification permission');
        setShowPermissionModal(false);
        // Don't save to localStorage so it shows again on next login
    };

    // Send a notification
    const sendNotification = ({ title, body, icon, tag, data, onClick }) => {
        console.log('🔔 Attempting to send notification:', { title, body, permission: Notification.permission });

        if (Notification.permission !== 'granted') {
            console.warn('⚠️ Notification permission not granted. Current permission:', Notification.permission);
            return null;
        }

        try {
            console.log('✅ Creating notification...');
            const notification = new Notification(title, {
                body,
                icon: icon || '/favicon.ico',
                badge: '/favicon.ico',
                tag: tag || 'default',
                data: data || {},
                requireInteraction: false,
                silent: false,
            });

            console.log('✅ Notification created successfully!');

            // Handle notification click
            if (onClick) {
                notification.onclick = (event) => {
                    console.log('🖱️ Notification clicked');
                    event.preventDefault();
                    window.focus();
                    onClick(event);
                    notification.close();
                };
            } else {
                notification.onclick = (event) => {
                    console.log('🖱️ Notification clicked (default handler)');
                    event.preventDefault();
                    window.focus();
                    notification.close();
                };
            }

            notification.onerror = (error) => {
                console.error('❌ Notification error:', error);
            };

            notification.onshow = () => {
                console.log('✅ Notification shown to user!');
            };

            notification.onclose = () => {
                console.log('🔕 Notification closed');
            };

            // Auto close after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);

            // Refresh in-app notifications
            fetchNotifications();

            return notification;
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            alert('Failed to create notification. Error: ' + error.message);
            return null;
        }
    };

    // Predefined notification types for common events
    const notificationTypes = {
        bookingConfirmed: (bookingDetails) => {
            sendNotification({
                title: '✅ Booking Confirmed!',
                body: `Your booking at ${bookingDetails.farmhouseName} is confirmed for ${bookingDetails.checkIn}`,
                tag: 'booking-confirmed',
                data: { bookingId: bookingDetails.id, type: 'booking' },
                onClick: () => {
                    window.location.href = `/trips/${bookingDetails.id}`;
                },
            });
        },

        bookingReminder: (bookingDetails) => {
            sendNotification({
                title: '📅 Upcoming Trip Reminder',
                body: `Your stay at ${bookingDetails.farmhouseName} starts tomorrow!`,
                tag: 'booking-reminder',
                data: { bookingId: bookingDetails.id, type: 'reminder' },
                onClick: () => {
                    window.location.href = `/trips/${bookingDetails.id}`;
                },
            });
        },

        paymentSuccess: (amount) => {
            sendNotification({
                title: '💳 Payment Successful',
                body: `Your payment of ₹${amount} has been processed successfully.`,
                tag: 'payment-success',
                data: { type: 'payment' },
            });
        },

        cancellationConfirmed: (bookingDetails) => {
            sendNotification({
                title: '⚠️ Cancellation Confirmed',
                body: `Your booking at ${bookingDetails.farmhouseName} has been cancelled.`,
                tag: 'cancellation',
                data: { bookingId: bookingDetails.id, type: 'cancellation' },
            });
        },

        refundProcessed: (amount) => {
            sendNotification({
                title: '💰 Refund Processed',
                body: `Your refund of ₹${amount} has been initiated and will be credited soon.`,
                tag: 'refund',
                data: { type: 'refund' },
            });
        },

        priceAlert: (farmhouseDetails) => {
            sendNotification({
                title: '🔔 Price Alert!',
                body: `${farmhouseDetails.name} now available at a discounted price!`,
                tag: 'price-alert',
                data: { farmhouseId: farmhouseDetails.id, type: 'alert' },
                onClick: () => {
                    window.location.href = `/farmhouses/${farmhouseDetails.id}`;
                },
            });
        },

        reviewReminder: (bookingDetails) => {
            sendNotification({
                title: '⭐ Share Your Experience',
                body: `How was your stay at ${bookingDetails.farmhouseName}? Write a review!`,
                tag: 'review-reminder',
                data: { bookingId: bookingDetails.id, type: 'review' },
                onClick: () => {
                    window.location.href = `/reviews/write/${bookingDetails.id}`;
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
