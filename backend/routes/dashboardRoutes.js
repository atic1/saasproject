const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const Booking = require('../models/booking');

// SUPERADMIN DASHBOARD ROUTE
router.get('/superadmin', async (req, res) => {
    try {
        const businesses = await Business.find({});
        
        // Mocking some stats that aren't in the DB directly
        const totalBusinesses = businesses.length;
        const totalUsers = 154; // Mocked
        const monthlyRecurringRevenue = businesses.length * 50000; // Mocked NPR 50k per business
        
        // Add mocked revenue to businesses for the UI table
        const businessesWithMockData = businesses.map(b => ({
            id: b._id,
            name: b.name,
            type: b.type,
            plan: b.subscription?.plan || 'starter',
            status: b.status,
            revenue: b.type === 'gym' ? 50000 : (b.type === 'clinic' ? 120000 : 30000)
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
        res.status(500).json({ message: "Server Error" });
    }
});

// BUSINESS DASHBOARD ROUTE
router.get('/business/:businessId', async (req, res) => {
    try {
        const business = await Business.findById(req.params.businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        const recentBookings = await Booking.find({ businessId: req.params.businessId }).sort({ date: 1 }).limit(10);
        
        // Map bookings for UI
        const mappedBookings = recentBookings.map(b => ({
            id: b._id,
            customer: b.customerName,
            type: b.type,
            date: b.date.toISOString().split('T')[0],
            time: b.startTime,
            status: b.status
        }));

        res.json({
            business: {
                id: business._id,
                name: business.name,
                type: business.type,
                members: business.type === 'gym' ? 120 : (business.type === 'clinic' ? 450 : 80), // Mocked
                revenue: business.type === 'gym' ? 50000 : (business.type === 'clinic' ? 120000 : 30000) // Mocked
            },
            recentBookings: mappedBookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
