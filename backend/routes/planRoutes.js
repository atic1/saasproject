const express = require('express');
const router = express.Router();
const Plan = require('../models/plan');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');

// Get all plans for a business
router.get('/:businessId', protect, enforceTenant, requirePermission('plan.read'), async (req, res) => {
    try {
        if (req.params.businessId !== req.activeBusinessId) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const plans = await Plan.find({ businessId: req.activeBusinessId }).sort({ "display.order": 1 });
        res.json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create a new plan
router.post('/:businessId', protect, enforceTenant, requireActiveSubscription, requirePermission('plan.create'), async (req, res) => {
    try {
        if (req.params.businessId !== req.activeBusinessId) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const newPlan = new Plan({
            ...req.body,
            businessId: req.activeBusinessId
        });
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
