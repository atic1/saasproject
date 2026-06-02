const express = require('express');
const router = express.Router();
const tenantQuery = require('../utils/tenantQuery');
const Business = require('../models/business');
const Booking = require('../models/booking');

const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');

/**
 * =========================
 * SUPER ADMIN DASHBOARD
 * =========================
 */
router.get('/superadmin', protect, async (req, res) => {
  try {
    // PLATFORM ROLE CHECK (FIXED)
    if (req.user.platformrole !== 'super_admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const businesses = await Business.find({});

    const totalBusinesses = businesses.length;
    const totalUsers = 154; // mock
    const monthlyRecurringRevenue =
      businesses.length * 50000;

    const businessesWithMockData = businesses.map((b) => ({
      id: b._id,
      name: b.name,
      type: b.type,
      plan: b.subscription?.plan || 'starter',
      status: b.status,
      revenue:
        b.type === 'gym'
          ? 50000
          : b.type === 'clinic'
          ? 120000
          : 30000
    }));

    res.json({
      stats: {
        totalBusinesses,
        totalUsers,
        monthlyRecurringRevenue
      },
      businesses: businessesWithMockData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * =========================
 * BUSINESS DASHBOARD
 * =========================
 */
router.get(
  '/business',
  protect,
  enforceTenant,
  async (req, res) => {
    try {
      const business = await Business.findById(
        req.activeBusinessId
      );

      if (!business) {
        return res.status(404).json({
          message: 'Business not found'
        });
      }

      const recentBookings = awaitBooking.find(tenantQuery(req));
        .sort({ date: -1 })
        .limit(10);

      const mappedBookings = recentBookings.map((b) => ({
        id: b._id,
        customer: b.customerName,
        type: b.type,
        date: b.date
          ? b.date.toISOString().split('T')[0]
          : null,
        time: b.startTime,
        status: b.status
      }));

      res.json({
        business: {
          id: business._id,
          name: business.name,
          type: business.type,
          members:
            business.type === 'gym'
              ? 120
              : business.type === 'clinic'
              ? 450
              : 80,
          revenue:
            business.type === 'gym'
              ? 50000
              : business.type === 'clinic'
              ? 120000
              : 30000
        },

        role: req.role,

        recentBookings: mappedBookings
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

module.exports = router;