const express = require('express');
const router = express.Router();
const Offer = require('../models/offer');

// Get all offers for a business
router.get('/:businessId', async (req, res) => {
    try {
        const offers = await Offer.find({ businessId: req.params.businessId });
        res.json(offers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create a new offer
router.post('/:businessId', async (req, res) => {
    try {
        const newOffer = new Offer({
            ...req.body,
            businessId: req.params.businessId
        });
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
