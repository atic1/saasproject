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

// Update a plan
router.put('/:businessId/:id', protect, enforceTenant, requireActiveSubscription, requirePermission('plan.update'), async (req, res) => {
    try {
        if (req.params.businessId !== req.activeBusinessId) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const plan = await Plan.findOne({ _id: req.params.id, businessId: req.activeBusinessId });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found.' });
        }

        const fieldsToUpdate = ['name', 'description', 'pricing', 'duration', 'features', 'display', 'limits', 'rules', 'isActive', 'isPublic'];
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                plan[field] = req.body[field];
            }
        });

        plan.updatedAt = new Date();
        await plan.save();
        res.json(plan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete a plan
router.delete('/:businessId/:id', protect, enforceTenant, requireActiveSubscription, requirePermission('plan.delete'), async (req, res) => {
    try {
        if (req.params.businessId !== req.activeBusinessId) {
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        const plan = await Plan.findOneAndDelete({ _id: req.params.id, businessId: req.activeBusinessId });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found.' });
        }

        res.json({ message: 'Plan deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
