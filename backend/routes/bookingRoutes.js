const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');
const { requirePermission } = require('../middleware/rbac');
const bookingController = require('../controllers/bookingController');

const tenantGuards = [protect, enforceTenant, requireActiveSubscription];

/**
 * =========================
 * CALENDAR ROUTES (MUST BE FIRST)
 * =========================
 */

/**
 * GET /api/bookings/calendar/day
 * Get bookings grouped by time for a specific day
 */
router.get(
  '/calendar/day',
  ...tenantGuards,
  requirePermission('booking.read'),
  bookingController.getBookingsByDay
);

/**
 * GET /api/bookings/calendar/week
 * Get bookings grouped by day for a week
 */
router.get(
  '/calendar/week',
  ...tenantGuards,
  requirePermission('booking.read'),
  bookingController.getBookingsByWeek
);

/**
 * =========================
 * CORE CRUD ROUTES
 * =========================
 */

/**
 * GET /api/bookings
 * Fetch all bookings for active business (with filters)
 */
router.get(
  '/',
  ...tenantGuards,
  requirePermission('booking.read'),
  bookingController.getBookings
);

/**
 * GET /api/bookings/:id
 * Fetch single booking
 */
router.get(
  '/:id',
  ...tenantGuards,
  requirePermission('booking.read'),
  bookingController.getBooking
);

/**
 * POST /api/bookings
 * Create new booking with conflict prevention
 */
router.post(
  '/',
  ...tenantGuards,
  requirePermission('booking.create'),
  bookingController.createBooking
);

/**
 * PUT /api/bookings/:id/status
 * Update booking status with state machine validation
 */
router.put(
  '/:id/status',
  ...tenantGuards,
  requirePermission('booking.update'),
  bookingController.updateBookingStatus
);

/**
 * PUT /api/bookings/:id/reschedule
 * Reschedule booking to new date/time
 */
router.put(
  '/:id/reschedule',
  ...tenantGuards,
  requirePermission('booking.update'),
  bookingController.rescheduleBooking
);

/**
 * DELETE /api/bookings/:id
 * Soft delete booking (mark as cancelled)
 */
router.delete(
  '/:id',
  ...tenantGuards,
  requirePermission('booking.delete'),
  bookingController.deleteBooking
);

module.exports = router;
