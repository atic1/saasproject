const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Business = require('../models/business');
const Booking = require('../models/booking');
const Customer = require('../models/customer');
const Payment = require('../models/payment');

//
// =========================
// BUSINESS DASHBOARD (path param - used by old PlansManagement)
// =========================
//
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    if (!mongoose.isValidObjectId(businessId)) {
      return res.status(400).json({ message: 'Invalid businessId format' });
    }
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const recentBookings = await Booking.find({ businessId })
      .sort({ date: -1 })
      .limit(10);

    const mappedBookings = recentBookings.map(b => ({
      id: b._id,
      customer: b.customerName || 'Unknown',
      type: b.type || 'Service',
      date: b.date ? b.date.toISOString().split('T')[0] : null,
      time: b.startTime || '',
      status: b.status || 'pending'
    }));

    const revenueAgg = await Payment.aggregate([
      { $match: { businessId: business._id, status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount.total' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const totalMembers = await Customer.countDocuments({ businessId });

    res.json({
      business: {
        id: business._id,
        name: business.name,
        type: business.type,
        status: business.status,
        slug: business.slug || business.name.toLowerCase().replace(/\s+/g, '-'),
        members: totalMembers,
        revenue: totalRevenue
      },
      recentBookings: mappedBookings
    });
  } catch (error) {
    console.error('Business dashboard error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

//
// =========================
// BUSINESS DASHBOARD (header-based - used by new DashboardHome.jsx)
// GET /api/dashboard/business  with  X-Business-Id header
// =========================
//
router.get('/business', async (req, res) => {
  try {
    const businessId = req.headers['x-business-id'];
    if (!businessId) {
      return res.status(400).json({ message: 'X-Business-Id header required' });
    }
    if (!mongoose.isValidObjectId(businessId)) {
      return res.status(400).json({ message: 'Invalid businessId format' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const recentBookings = await Booking.find({ businessId })
      .sort({ date: -1 })
      .limit(10);

    const mappedBookings = recentBookings.map(b => ({
      id: b._id,
      customer: b.customerName || 'Unknown',
      type: b.type || 'Service',
      date: b.date ? b.date.toISOString().split('T')[0] : null,
      time: b.startTime || '',
      status: b.status || 'pending'
    }));

    const revenueAgg = await Payment.aggregate([
      { $match: { businessId: business._id, status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount.total' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    const totalMembers = await Customer.countDocuments({ businessId });

    res.json({
      business: {
        id: business._id,
        name: business.name,
        type: business.type,
        status: business.status,
        slug: business.slug || business.name.toLowerCase().replace(/\s+/g, '-'),
        members: totalMembers,
        revenue: totalRevenue
      },
      recentBookings: mappedBookings
    });
  } catch (error) {
    console.error('Business dashboard error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

//
// =========================
// SUPERADMIN DASHBOARD (used by new DashboardHome.jsx isSuperAdmin path)
// GET /api/dashboard/superadmin
// =========================
//
router.get('/superadmin', async (req, res) => {
  try {
    const total = await Business.countDocuments({});
    const active = await Business.countDocuments({ status: 'active' });
    const pending = await Business.countDocuments({ status: { $in: ['pending', 'pending_verification'] } });
    const totalUsers = await Customer.countDocuments({});

    const businesses = await Business.find({ status: 'active' })
      .select('name type status')
      .limit(20);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount.total' } } }
    ]);
    const monthlyRecurringRevenue = revenueAgg[0]?.total || 0;

    res.json({
      stats: {
        totalBusinesses: total,
        active,
        pending,
        totalUsers,
        monthlyRecurringRevenue
      },
      businesses: businesses.map(b => ({
        id: b._id,
        name: b.name,
        type: b.type,
        status: b.status
      }))
    });
  } catch (error) {
    console.error('Superadmin dashboard error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;