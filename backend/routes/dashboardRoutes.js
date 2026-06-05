const express = require('express');
const router = express.Router();

const Business = require('../models/business');
const Booking = require('../models/booking');
const Customer = require('../models/customer');
const Payment = require('../models/payment');

//
// =========================
// BUSINESS DASHBOARD
// =========================
//
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
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

module.exports = router;