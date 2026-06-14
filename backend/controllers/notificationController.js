const Notification = require('../models/notification');

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
    try {
        const {
            recipientType, recipientId, recipientPhone, recipientEmail,
            type, title, message, template, channel, referenceType, referenceId
        } = req.body;

        const businessId = req.activeBusinessId;

        if (!recipientType || !type || !channel) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const notification = new Notification({
            businessId,
            recipientType,
            recipientId,
            recipientPhone,
            recipientEmail,
            type,
            title,
            message,
            template,
            channel,
            status: 'pending',
            referenceType,
            referenceId
        });

        const createdNotification = await notification.save();
        res.status(201).json(createdNotification);
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all notifications for a specific business
// @route   GET /api/notifications/business/:businessId
// @access  Private
const getBusinessNotifications = async (req, res) => {
    try {
        const { businessId } = req.params;
        const { status, channel, type, limit = 50 } = req.query;

        if (businessId !== req.activeBusinessId) {
            return res.status(403).json({ message: "Access denied: Tenant mismatch" });
        }

        // Build filter query
        let query = { businessId: req.activeBusinessId };
        if (status) query.status = status;
        if (channel) query.channel = channel;
        if (type) query.type = type;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get notifications for a specific recipient (e.g., customer or user)
// @route   GET /api/notifications/recipient/:recipientId
// @access  Private
const getRecipientNotifications = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const notifications = await Notification.find({ recipientId, businessId: req.activeBusinessId })
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching recipient notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update notification status (e.g., mark as read, sent, delivered, failed)
// @route   PUT /api/notifications/:id/status
// @access  Private
const updateNotificationStatus = async (req, res) => {
    try {
        const { status, errorMessage } = req.body;
        
        const validStatuses = ['pending', 'sent', 'delivered', 'failed', 'read'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updateData = { status };
        
        // Add timestamps based on status
        if (status === 'sent') updateData.sentAt = Date.now();
        if (status === 'delivered') updateData.deliveredAt = Date.now();
        if (status === 'read') updateData.readAt = Date.now();
        if (status === 'failed' && errorMessage) updateData.errorMessage = errorMessage;

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, businessId: req.activeBusinessId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error("Error updating notification status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            businessId: req.activeBusinessId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createNotification,
    getBusinessNotifications,
    getRecipientNotifications,
    updateNotificationStatus,
    deleteNotification
};
