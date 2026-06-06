const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const Booking = require('../models/booking');
const User = require('../models/user');
const Customer = require('../models/customer');
const Payment = require('../models/payment');
const Plan = require('../models/plan');
const Offer = require('../models/offer');
const Notification = require('../models/notification');
const { checkRole } = require('../middleware/auth');

// Protect all superadmin routes with checkRole
router.use(checkRole(['super_admin']));

// Interactive In-Memory Support Tickets
let mockSupportTickets = [
    { id: "st1", businessName: "FitZone Gym", ownerName: "Madan KC", email: "madan@fitzone.com.np", message: "Help! I am trying to enable the eSewa integration but it keeps saying invalid merchant credentials.", status: "unread", createdAt: new Date(Date.now() - 4 * 3600000) },
    { id: "st2", businessName: "Smile Dental Clinic", ownerName: "Dr. Sita Pathak", email: "contact@smiledental.com.np", message: "Our SMS reminder credits are depleted. How can we purchase an add-on package?", status: "unread", createdAt: new Date(Date.now() - 12 * 3600000) },
    { id: "st3", businessName: "Glow Beauty Salon", ownerName: "Gita Basnet", email: "gita.glow@gmail.com", message: "How do we modify the booking slots interval from 30 minutes to 45 minutes?", status: "unread", createdAt: new Date(Date.now() - 24 * 3600000) }
];

// GET /api/superadmin/dashboard
// Returns platform-wide statistics and recent registrations
router.get('/dashboard', async (req, res) => {
    try {
        const total = await Business.countDocuments({});
        const active = await Business.countDocuments({ status: 'active' });
        const pending = await Business.countDocuments({ status: { $in: ['pending', 'pending_verification'] } });
        const rejected = await Business.countDocuments({ status: 'rejected' });
        const suspended = await Business.countDocuments({ status: 'suspended' });

        const recentRegistrations = await Business.find({})
            .sort({ createdAt: -1 })
            .limit(10);

        const mappedRecent = recentRegistrations.map(b => ({
            id: b._id,
            name: b.name,
            type: b.type,
            status: b.status,
            createdAt: b.createdAt,
            city: b.contact?.city || 'N/A'
        }));

        res.json({
            stats: {
                total,
                active,
                pending,
                rejected,
                suspended
            },
            recentRegistrations: mappedRecent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/superadmin/businesses
// Search and filter all registered businesses
router.get('/businesses', async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (status && status !== 'all') {
            if (status === 'pending') {
                query.status = { $in: ['pending', 'pending_verification'] };
            } else {
                query.status = status;
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'contact.email': { $regex: search, $options: 'i' } },
                { 'contact.city': { $regex: search, $options: 'i' } }
            ];
        }

        const businesses = await Business.find(query).sort({ createdAt: -1 });

        const mappedBusinesses = businesses.map(b => ({
            id: b._id,
            name: b.name,
            type: b.type,
            status: b.status,
            ownerName: b.contact?.phone ? `Owner (${b.contact.phone})` : 'N/A', // Mocking owner name using contact info since user model is separate
            email: b.contact?.email || 'N/A',
            phone: b.contact?.phone || 'N/A',
            city: b.contact?.city || 'N/A',
            address: b.contact?.address || 'N/A',
            createdAt: b.createdAt,
            trialEnds: b.subscription?.trialEnds || null
        }));

        res.json(mappedBusinesses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/superadmin/businesses/:id/status
// Approve, Reject, Suspend, Reactivate a business
router.put('/businesses/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['active', 'rejected', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        business.status = status;
        await business.save();

        // Create a Mock platform notification for approval/rejection
        const title = status === 'active' ? "Business Approved 🎉" : status === 'rejected' ? "Registration Rejected ❌" : "Account Suspended ⚠️";
        const message = status === 'active' 
            ? `Congratulations! Your business "${business.name}" has been approved and granted access to the BizNepal SaaS platform.`
            : status === 'rejected'
            ? `We regret to inform you that your registration for "${business.name}" has been rejected. Please verify your details.`
            : `Your business dashboard for "${business.name}" has been suspended due to system billing policies.`;

        // Save mock notification in db
        try {
            await Notification.create({
                businessId: business._id.toString(),
                recipientType: 'owner',
                type: status === 'active' ? 'welcome' : 'system_alert',
                title,
                message,
                channel: 'in_app',
                status: 'pending'
            });
        } catch (notifErr) {
            console.error("Error creating system notification:", notifErr);
        }

        res.json({ success: true, message: `Business status successfully updated to ${status}`, business });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// DELETE /api/superadmin/businesses/:id
// Deletes a business and all linked resources (multitenancy clean up)
router.delete('/businesses/:id', async (req, res) => {
    try {
        const businessId = req.params.id;
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ success: false, message: "Business not found" });
        }

        // Perform cascading deletions across all linked multitenant collections
        await Business.findByIdAndDelete(businessId);
        await Booking.deleteMany({ businessId });
        await Customer.deleteMany({ businessId });
        await Payment.deleteMany({ businessId });
        await Plan.deleteMany({ businessId });
        await Offer.deleteMany({ businessId });
        await User.deleteMany({ businessId });
        await Notification.deleteMany({ businessId });

        res.json({ success: true, message: "Business and all associated records permanently deleted." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/superadmin/notifications
// Retrieves dynamic signup requests, support tickets, and expiring subscriptions
router.get('/notifications', async (req, res) => {
    try {
        // 1. Pending Signup requests (businesses with status pending)
        const pendingBusinesses = await Business.find({ status: { $in: ['pending', 'pending_verification'] } }).sort({ createdAt: -1 });

        // 2. Subscription warnings (trialEnds or currentPeriodEnd within the next 7 days)
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);

        const expiringBusinesses = await Business.find({
            $or: [
                { 'subscription.trialEnds': { $gte: now, $lte: sevenDaysLater } },
                { 'subscription.currentPeriodEnd': { $gte: now, $lte: sevenDaysLater } }
            ]
        });

        const subscriptionWarnings = expiringBusinesses.map(b => {
            const expDate = b.subscription.trialEnds || b.subscription.currentPeriodEnd;
            const daysLeft = Math.ceil((new Date(expDate) - now) / (1000 * 60 * 60 * 24));
            return {
                id: b._id,
                businessName: b.name,
                plan: b.subscription.plan,
                expirationDate: expDate,
                daysRemaining: daysLeft > 0 ? daysLeft : 0
            };
        });

        res.json({
            pendingSignups: pendingBusinesses.map(b => ({
                id: b._id,
                name: b.name,
                email: b.contact?.email || 'N/A',
                phone: b.contact?.phone || 'N/A',
                createdAt: b.createdAt
            })),
            supportTickets: mockSupportTickets,
            subscriptionWarnings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/superadmin/support-tickets/:id/resolve
// Handles resolving/closing mock support complaints
router.put('/support-tickets/:id/resolve', (req, res) => {
    const { id } = req.params;
    const ticketIndex = mockSupportTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
        return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    mockSupportTickets[ticketIndex].status = 'resolved';
    res.json({ success: true, message: "Ticket marked as resolved", tickets: mockSupportTickets });
});

module.exports = router;
