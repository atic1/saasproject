const express = require('express');
const router = express.Router();
const Trainer = require('../models/trainer');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { checkTenantMatch } = require('../middleware/tenantHelper');

// Get all trainers for a business
router.get('/:businessId', protect, enforceTenant, async (req, res) => {
  try {
    if (!checkTenantMatch(req)) {
      return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
    }

    const trainers = await Trainer.find({ businessId: req.activeBusinessId }).sort({ createdAt: -1 });
    res.json(trainers);
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Create a new trainer
router.post('/:businessId', protect, enforceTenant, async (req, res) => {
  try {
    if (!checkTenantMatch(req)) {
      return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
    }

    const { name, photo, specialization, experience } = req.body;
    if (!name || !specialization || !experience) {
      return res.status(400).json({ message: "Name, specialization, and experience are required." });
    }

    const newTrainer = new Trainer({
      businessId: req.activeBusinessId,
      name,
      photo,
      specialization,
      experience
    });

    await newTrainer.save();
    res.status(201).json(newTrainer);
  } catch (error) {
    console.error('Error creating trainer:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update a trainer
router.put('/:businessId/:id', protect, enforceTenant, async (req, res) => {
  try {
    if (!checkTenantMatch(req)) {
      return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
    }

    const { name, photo, specialization, experience } = req.body;

    const trainer = await Trainer.findOne({ _id: req.params.id, businessId: req.activeBusinessId });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found.' });
    }

    if (name) trainer.name = name;
    if (photo !== undefined) trainer.photo = photo;
    if (specialization) trainer.specialization = specialization;
    if (experience) trainer.experience = experience;

    await trainer.save();
    res.json(trainer);
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete a trainer
router.delete('/:businessId/:id', protect, enforceTenant, async (req, res) => {
  try {
    if (!checkTenantMatch(req)) {
      return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
    }

    const trainer = await Trainer.findOneAndDelete({ _id: req.params.id, businessId: req.activeBusinessId });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found.' });
    }

    res.json({ message: 'Trainer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
