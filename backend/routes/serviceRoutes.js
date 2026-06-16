const express = require('express');
const router = express.Router();
const Service = require('../models/service');
const { protect, requireBusinessRole } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');

// @route   GET /api/services
// @desc    Get all active services for the current business tenant
// @access  Public / Private (Public so customers can browse services on booking page)
router.get('/', async (req, res) => {
  try {
    // Determine business ID from header or context
    const businessId = req.headers['x-business-id'] || req.query.businessId;
    if (!businessId) {
      return res.status(400).json({ message: 'businessId required in X-Business-Id header or query parameters.' });
    }

    const services = await Service.find({
      businessId,
      isActive: true
    }).sort({ name: 1 });

    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services.' });
  }
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Private (Owner/Manager role required)
router.post('/', protect, enforceTenant, requireBusinessRole(['owner', 'manager']), async (req, res) => {
  try {
    const { name, description, duration, price, capacity, type } = req.body;

    if (!name || !duration || !price || !type) {
      return res.status(400).json({ message: 'Missing required fields: name, duration, price, type' });
    }

    const service = new Service({
      businessId: req.activeBusinessId,
      name,
      description,
      duration: Number(duration),
      price: Number(price),
      capacity: Number(capacity) || 1,
      type
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Failed to create service.', error: error.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update an existing service
// @access  Private (Owner/Manager role required)
router.put('/:id', protect, enforceTenant, requireBusinessRole(['owner', 'manager']), async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, businessId: req.activeBusinessId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Failed to update service.', error: error.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Soft delete / Deactivate a service
// @access  Private (Owner/Manager role required)
router.delete('/:id', protect, enforceTenant, requireBusinessRole(['owner', 'manager']), async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, businessId: req.activeBusinessId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.json({ message: 'Service deactivated successfully.', service });
  } catch (error) {
    console.error('Error deactivating service:', error);
    res.status(500).json({ message: 'Failed to deactivate service.' });
  }
});

module.exports = router;
