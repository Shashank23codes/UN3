const Notification = require('../models/Notification');

// Helper function to create notification
const createNotification = async ({ recipient, recipientModel, type, title, message, booking, data }) => {
    try {
        const notification = await Notification.create({
            recipient,
            recipientModel,
            type,
            title,
            message,
            booking,
            data
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// @desc    Get user/vendor notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        // Determine if user or vendor or admin based on which middleware was used
        const recipientId = req.user?.id || req.vendor?.id || req.admin?.id;
        let recipientModel;
        if (req.user) recipientModel = 'User';
        else if (req.vendor) recipientModel = 'Vendor';
        else if (req.admin) recipientModel = 'Admin';

        const notifications = await Notification.find({
            recipient: recipientId,
            recipientModel
        })
            .populate('booking', 'receiptNumber checkIn checkOut')
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: recipientId,
            recipientModel,
            read: false
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const recipientId = req.user?.id || req.vendor?.id || req.admin?.id;
        if (notification.recipient.toString() !== recipientId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        notification.read = true;
        notification.readAt = new Date();
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const recipientId = req.user?.id || req.vendor?.id || req.admin?.id;
        let recipientModel;
        if (req.user) recipientModel = 'User';
        else if (req.vendor) recipientModel = 'Vendor';
        else if (req.admin) recipientModel = 'Admin';

        await Notification.updateMany(
            { recipient: recipientId, recipientModel, read: false },
            { read: true, readAt: new Date() }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const recipientId = req.user?.id || req.vendor?.id || req.admin?.id;
        if (notification.recipient.toString() !== recipientId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await notification.deleteOne();
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
