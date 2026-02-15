# Browser Notification System - Implementation Guide

## 🎉 Overview

This notification system enables your web application to send **OS-level browser notifications** to users, even when the browser window is minimized or in the background. The system is fully integrated and production-ready!

## ✨ Features

- ✅ **Permission Modal**: Beautiful UI that requests notification permission from users
- ✅ **Auto-Request**: Automatically asks logged-in users for permission (after 5 seconds)
- ✅ **Predefined Notification Types**: 8 ready-to-use notification templates
- ✅ **Custom Notifications**: Send any custom notification
- ✅ **Click Handling**: Navigate users to relevant pages when they click notifications
- ✅ **Browser Compatibility**: Works on all modern browsers (Chrome, Firefox, Edge, Safari)
- ✅ **Permission Persistence**: Remembers user's choice using localStorage
- ✅ **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 How It Works

### 1. **Automatic Permission Request**
When a user logs in for the first time, they'll see a beautiful modal after 5 seconds asking for notification permission.

### 2. **Available Notification Types**

The system includes these predefined notification types:

#### **bookingConfirmed**
```javascript
import { useNotification } from '../context/NotificationContext';

const { bookingConfirmed } = useNotification();

bookingConfirmed({
  id: 'booking123',
  farmhouseName: 'Beautiful Farmhouse',
  checkIn: 'Dec 25, 2025'
});
```

#### **bookingReminder**
```javascript
const { bookingReminder } = useNotification();

bookingReminder({
  id: 'booking123',
  farmhouseName: 'Beautiful Farmhouse',
  checkIn: 'Tomorrow'
});
```

#### **paymentSuccess**
```javascript
const { paymentSuccess } = useNotification();

paymentSuccess(5000); // Amount in rupees
```

#### **cancellationConfirmed**
```javascript
const { cancellationConfirmed } = useNotification();

cancellationConfirmed({
  id: 'booking123',
  farmhouseName: 'Beautiful Farmhouse'
});
```

#### **refundProcessed**
```javascript
const { refundProcessed } = useNotification();

refundProcessed(3500); // Refund amount
```

#### **priceAlert**
```javascript
const { priceAlert } = useNotification();

priceAlert({
  id: 'farmhouse123',
  name: 'Luxury Villa'
});
```

#### **reviewReminder**
```javascript
const { reviewReminder } = useNotification();

reviewReminder({
  id: 'booking123',
  farmhouseName: 'Beautiful Farmhouse'
});
```

#### **generalUpdate**
```javascript
const { generalUpdate } = useNotification();

generalUpdate('New Feature! 🎉', 'Check out our new search filters!');
```

### 3. **Custom Notifications**

For complete control, use the `sendNotification` function:

```javascript
const { sendNotification } = useNotification();

sendNotification({
  title: '🎉 Special Offer!',
  body: 'Get 20% off on your next booking',
  icon: '/path/to/icon.png', // Optional
  tag: 'special-offer', // Optional - groups similar notifications
  data: { offerId: '123' }, // Optional - custom data
  onClick: () => {
    // Custom action when notification is clicked
    window.location.href = '/offers/123';
  }
});
```

## 📝 Implementation Examples

### Example 1: Booking Confirmation Page
```javascript
import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

const BookingConfirmation = () => {
  const { bookingConfirmed, paymentSuccess } = useNotification();
  
  useEffect(() => {
    // Send notifications when booking is confirmed
    const booking = getBookingData(); // Your function to get booking data
    
    if (booking.status === 'confirmed') {
      bookingConfirmed({
        id: booking.id,
        farmhouseName: booking.farmhouse.name,
        checkIn: new Date(booking.checkIn).toLocaleDateString()
      });
      
      paymentSuccess(booking.payment.advanceAmount);
    }
  }, []);
  
  return <div>Booking confirmed!</div>;
};
```

### Example 2: Scheduled Reminders (Backend Integration)

You can create a cron job on your backend that triggers notifications through WebSockets or polling:

```javascript
// In your frontend component
import { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationListener = () => {
  const { bookingReminder, generalUpdate } = useNotification();
  
  useEffect(() => {
    // Poll for pending notifications every 5 minutes
    const interval = setInterval(async () => {
      const token = localStorage.getItem('userToken');
      const res = await fetch('/api/notifications/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifications = await res.json();
      
      notifications.forEach(notif => {
        switch(notif.type) {
          case 'booking_reminder':
            bookingReminder(notif.data);
            break;
          case 'general':
            generalUpdate(notif.title, notif.message);
            break;
        }
      });
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
};
```

### Example 3: Manual Permission Request

Add a button in settings to manually request/check permission:

```javascript
import { useNotification } from '../context/NotificationContext';

const NotificationSettings = () => {
  const { notificationPermission, requestPermission } = useNotification();
  
  return (
    <div>
      <h3>Notification Settings</h3>
      <p>Status: {notificationPermission}</p>
      
      {notificationPermission === 'default' && (
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      )}
      
      {notificationPermission === 'granted' && (
        <p className="text-green-600">✓ Notifications are enabled</p>
      )}
      
      {notificationPermission === 'denied' && (
        <p className="text-red-600">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      )}
    </div>
  );
};
```

## 🎨 Customization

### Change Modal Timing
Edit `NotificationContext.jsx` line 22 to change when the modal appears:

```javascript
setTimeout(() => {
  setShowPermissionModal(true);
}, 5000); // Change this value (in milliseconds)
```

### Customize Modal Design
Edit `NotificationPermissionModal.jsx` to change colors, text, or layout.

### Add New Notification Types
In `NotificationContext.jsx`, add to the `notificationTypes` object:

```javascript
const notificationTypes = {
  // ... existing types
  
  newOfferAlert: (offerDetails) => {
    sendNotification({
      title: '🔥 Hot Deal!',
      body: `${offerDetails.name} - ${offerDetails.discount}% off`,
      tag: 'offer-alert',
      data: { offerId: offerDetails.id },
      onClick: () => {
        window.location.href = `/offers/${offerDetails.id}`;
      },
    });
  },
};
```

## 🔔 Browser Compatibility

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅ Yes  | ✅ Yes |
| Firefox | ✅ Yes  | ✅ Yes |
| Safari  | ✅ Yes  | ✅ Yes (iOS 16.4+) |
| Edge    | ✅ Yes  | ✅ Yes |

## 📱 Testing Notifications

1. **Start your development server**
2. **Login to your app**
3. **Wait for the permission modal** (or reload the page)
4. **Click "Enable Notifications"**
5. **Navigate to a booking confirmation page** to see notifications in action

To test manually:
```javascript
// Open browser console and run:
useNotification().generalUpdate('Test', 'This is a test notification!');
```

## 🛠️ Troubleshooting

### Notifications not appearing?

1. **Check permission status**: 
   ```javascript
   console.log(Notification.permission); // Should be "granted"
   ```

2. **Browser settings**: Make sure notifications aren't blocked in browser settings

3. **HTTPS required**: Notifications only work on HTTPS (or localhost for development)

4. **Focus Detection**: Some browsers don't show notifications when the tab is active and focused

### Reset permission for testing

In Chrome DevTools:
1. Click the lock icon in address bar
2. Find "Notifications" 
3. Select "Ask" or "Block" to reset

## 🚀 Backend Integration (Optional)

To send notifications from your backend (for scheduled reminders, etc.), you can:

1. **Store notification preferences** in user model
2. **Use WebSockets** (Socket.io) for real-time notifications
3. **Use polling** - fetch pending notifications periodically
4. **Use Push Notifications API** for true background notifications (requires service worker)

### Example Backend Route
```javascript
// backend/routes/notificationRoutes.js
router.get('/pending', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  // Get bookings with check-in tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const upcomingBookings = await Booking.find({
    user: userId,
    checkIn: {
      $gte: tomorrow.setHours(0,0,0,0),
      $lte: tomorrow.setHours(23,59,59,999)
    },
    reminderSent: false
  }).populate('farmhouse');
  
  const notifications = upcomingBookings.map(booking => ({
    type: 'booking_reminder',
    data: {
      id: booking._id,
      farmhouseName: booking.farmhouse.name
    }
  }));
  
  // Mark reminders as sent
  await Booking.updateMany(
    { _id: { $in: upcomingBookings.map(b => b._id) } },
    { reminderSent: true }
  );
  
  res.json(notifications);
});
```

## 📊 Analytics (Recommended)

Track notification engagement:

```javascript
const { sendNotification } = useNotification();

sendNotification({
  title: 'New Offer!',
  body: 'Check it out',
  onClick: () => {
    // Track click
    analytics.track('Notification Clicked', {
      type: 'offer',
      offerId: '123'
    });
    
    window.location.href = '/offers/123';
  }
});
```

## 🎯 Best Practices

1. ✅ **Don't spam**: Only send important, valuable notifications
2. ✅ **Be timely**: Send at appropriate times (avoid late night)
3. ✅ **Be clear**: Use concise, action-oriented messages
4. ✅ **Respect choice**: Make it easy to disable notifications
5. ✅ **Test thoroughly**: Test on different browsers and devices
6. ✅ **Provide value**: Each notification should benefit the user

## 📞 Support

If you need help or want to add more features:
- Check browser console for errors
- Verify notification permission status
- Test in incognito mode to reset permissions
- Check HTTPS is enabled (required for production)

---

**🎉 Your notification system is ready to use! Users will now receive important updates even when they're not actively browsing your site.**
