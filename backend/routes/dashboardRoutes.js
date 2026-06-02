const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const Booking = require('../models/booking');
const User = require('../models/user');
const Customer = require('../models/customer');
const Payment = require('../models/payment');

// SUPERADMIN DASHBOARD ROUTE
router.get('/superadmin', async (req, res) => {
    try {
        const businesses = await Business.find({});
        
        const totalBusinesses = businesses.length;
        const totalUsers = await User.countDocuments({});
        
        // Aggregate total revenue from all completed payments
        const revenueAggregation = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount.total" } } }
        ]);
        const monthlyRecurringRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
        
        // Fetch revenue per business
        const businessRevenues = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: "$businessId", totalRevenue: { $sum: "$amount.total" } } }
        ]);
        
        const revenueMap = {};
        businessRevenues.forEach(br => {
            revenueMap[br._id] = br.totalRevenue;
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

// BUSINESS DASHBOARD ROUTE
router.get('/business/:businessId', async (req, res) => {
    try {
        const business = await Business.findById(req.params.businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        const recentBookings = await Booking.find({ businessId: req.params.businessId }).sort({ date: -1 }).limit(10);
        
        // Map bookings for UI
        const mappedBookings = recentBookings.map(b => ({
            id: b._id,
            customer: b.customerName,
            type: b.type,
            date: b.date ? b.date.toISOString().split('T')[0] : 'N/A',
            time: b.startTime,
            status: b.status
        }));

        const totalMembers = await Customer.countDocuments({ businessId: req.params.businessId });
        
        const revenueAggregation = await Payment.aggregate([
            { $match: { businessId: req.params.businessId, status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount.total" } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        res.json({
            business: {
                id: business._id,
                name: business.name,
                type: business.type,
                members: totalMembers,
                revenue: totalRevenue
            },
            recentBookings: mappedBookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
