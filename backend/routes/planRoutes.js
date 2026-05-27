const express = require('express');
const router = express.Router();
const Plan = require('../models/plan');

// Get all plans for a business
router.get('/:businessId', async (req, res) => {
    try {
        const plans = await Plan.find({ businessId: req.params.businessId }).sort({ "display.order": 1 });
        res.json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create a new plan
router.post('/:businessId', async (req, res) => {
    try {
        const newPlan = new Plan({
            ...req.body,
            businessId: req.params.businessId
        });
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
