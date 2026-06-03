const express = require('express');
const router = express.Router();

const tenantQuery = require('../utils/tenantQuery');
const Business = require('../models/business');
const Booking = require('../models/booking');
const User = require('../models/user');
const Customer = require('../models/customer');
const Payment = require('../models/payment');

const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');

//
// =========================
// SUPER ADMIN DASHBOARD
// =========================
//
router.get('/superadmin', protect, async (req, res) => {
  try {
    if (req.user.platformrole !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const businesses = await Business.find({});

    const totalBusinesses = businesses.length;
    const totalUsers = await User.countDocuments({});

    const revenueAggregation = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount.total" }
        }
      }
    ]);

    const monthlyRecurringRevenue =
      revenueAggregation.length > 0
        ? revenueAggregation[0].totalRevenue
        : 0;

    const businessRevenues = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: "$businessId",
          totalRevenue: { $sum: "$amount.total" }
        }
      }
    ]);

    const revenueMap = {};
    businessRevenues.forEach(b => {
      revenueMap[b._id.toString()] = b.totalRevenue;
    });

    const businessesWithRealData = businesses.map(b => ({
      id: b._id,
      name: b.name,
      type: b.type,
      plan: b.subscription?.plan || 'starter',
      status: b.status,
      revenue: revenueMap[b._id.toString()] || 0
    }));

    res.json({
      stats: {
        totalBusinesses,
        totalUsers,
        monthlyRecurringRevenue
      },
      businesses: businessesWithRealData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//
// =========================
// BUSINESS DASHBOARD
// =========================
//
router.get('/business', protect, enforceTenant, async (req, res) => {
  try {
    const business = await Business.findById(req.activeBusinessId);

    // ✅ FIX: required safety check
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const recentBookings = await Booking.find(tenantQuery(req))
      .sort({ date: -1 })
      .limit(10);

    const mappedBookings = recentBookings.map(b => ({
      id: b._id,
      customer: b.customerName,
      type: b.type,
      date: b.date ? b.date.toISOString().split('T')[0] : null,
      time: b.startTime,
      status: b.status
    }));

    const revenueAgg = await Payment.aggregate([
      {
        $match: {
          businessId: req.activeBusinessId,
          status: "completed"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount.total" }
        }
      }
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const totalMembers = await Customer.countDocuments({
      businessId: req.activeBusinessId
    });

    res.json({
      business: {
        id: business._id,
        name: business.name,
        type: business.type,
        members: totalMembers,
        revenue: totalRevenue
      },
      role: req.role,
      recentBookings: mappedBookings
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;