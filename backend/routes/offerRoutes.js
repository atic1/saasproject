const express = require('express');
const router = express.Router();
const Offer = require('../models/offer');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');

// Get all offers for a business
router.get('/:businessId', protect, enforceTenant, requirePermission('offer.read'), async (req, res) => {
    try {
        if (req.params.businessId !== req.activeBusinessId) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const offers = await Offer.find({ businessId: req.activeBusinessId });
        res.json(offers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create a new offer
router.post('/:businessId', protect, enforceTenant, requireActiveSubscription, requirePermission('offer.create'), async (req, res) => {
    try {
        if (req.params.businessId !== req.activeBusinessId) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const newOffer = new Offer({
            ...req.body,
            businessId: req.activeBusinessId
        });
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
