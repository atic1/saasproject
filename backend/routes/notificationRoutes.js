const express = require('express');
const router = express.Router();
const {
    createNotification,
    getBusinessNotifications,
    getRecipientNotifications,
    updateNotificationStatus,
    deleteNotification
} = require('../controllers/notificationController');

// Routes
router.post('/', createNotification);
router.get('/business/:businessId', getBusinessNotifications);
router.get('/recipient/:recipientId', getRecipientNotifications);
router.put('/:id/status', updateNotificationStatus);
router.delete('/:id', deleteNotification);

module.exports = router;
