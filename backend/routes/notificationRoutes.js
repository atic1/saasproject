const express = require('express');
const router = express.Router();
const {
    createNotification,
    getBusinessNotifications,
    getRecipientNotifications,
    updateNotificationStatus,
    deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');

// All notification routes are protected and tenant isolated
router.use(protect);
router.use(enforceTenant);

// Routes
router.post('/', requirePermission('notification.create'), createNotification);
router.get('/business/:businessId', requirePermission('notification.read'), getBusinessNotifications);
router.get('/recipient/:recipientId', requirePermission('notification.read'), getRecipientNotifications);
router.put('/:id/status', requirePermission('notification.update'), updateNotificationStatus);
router.delete('/:id', requirePermission('notification.delete'), deleteNotification);

module.exports = router;
