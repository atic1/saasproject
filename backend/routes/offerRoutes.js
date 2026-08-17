const express = require('express');
const router = express.Router();
const Offer = require('../models/offer');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');
const { checkTenantMatch } = require('../middleware/tenantHelper');

// Get all offers for a business
router.get('/:businessId', protect, enforceTenant, requirePermission('offer.read'), async (req, res) => {
    try {
        if (!checkTenantMatch(req)) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const offers = await Offer.find({ businessId: req.activeBusinessId }).sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Create a new offer
router.post('/:businessId', protect, enforceTenant, requireActiveSubscription, requirePermission('offer.create'), async (req, res) => {
    try {
        if (!checkTenantMatch(req)) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const newOffer = new Offer({
            ...req.body,
            businessId: req.activeBusinessId
        });
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Update an offer
router.put('/:businessId/:id', protect, enforceTenant, requireActiveSubscription, requirePermission('offer.update'), async (req, res) => {
    try {
        if (!checkTenantMatch(req)) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const offer = await Offer.findOne({ _id: req.params.id, businessId: req.activeBusinessId });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found.' });
        }

        const fieldsToUpdate = ['name', 'description', 'code', 'discount', 'applicability', 'validity', 'limits', 'display', 'isActive', 'status'];
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                offer[field] = req.body[field];
            }
        });

        offer.updatedAt = new Date();
        await offer.save();
        res.json(offer);
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Delete an offer
router.delete('/:businessId/:id', protect, enforceTenant, requireActiveSubscription, requirePermission('offer.delete'), async (req, res) => {
    try {
        if (!checkTenantMatch(req)) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const offer = await Offer.findOneAndDelete({ _id: req.params.id, businessId: req.activeBusinessId });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found.' });
        }

        res.json({ message: 'Offer deleted successfully.' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
