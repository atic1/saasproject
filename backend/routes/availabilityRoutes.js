const express = require('express');
const router = express.Router();
const Availability = require('../models/availability');
const { protect, requireBusinessRole } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');

// @route   GET /api/availability
// @desc    Get availability slots for the business tenant, optional filters for staffId & date
// @access  Public / Private (Public so customers can select slots)
router.get('/', async (req, res) => {
  try {
    const businessId = req.headers['x-business-id'] || req.query.businessId;
    if (!businessId) {
      return res.status(400).json({ message: 'businessId required in X-Business-Id header or query parameters.' });
    }

    const { staffId, date } = req.query;

    const query = { businessId, isAvailable: true };
    if (staffId) {
      query.staffId = staffId;
    }

    if (date) {
      const targetDate = new Date(date);
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayOfWeek = days[targetDate.getDay()];

      // Look for specific date override first
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const override = await Availability.findOne({
        businessId,
        staffId: staffId || null,
        dateOverride: { $gte: startOfDay, $lte: endOfDay }
      });

      if (override) {
        return res.json(override);
      }

      // If no override, query default day of week schedule
      query.dayOfWeek = dayOfWeek;
      query.dateOverride = null;
    }

    const schedules = await Availability.find(query);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability.' });
  }
});

// @route   POST /api/availability
// @desc    Set or update weekly availability configuration
// @access  Private (Owner/Manager role required)
router.post('/', protect, enforceTenant, requireBusinessRole(['owner', 'manager']), async (req, res) => {
  try {
    const { staffId, dayOfWeek, slots, dateOverride, isAvailable } = req.body;

    if (!dayOfWeek || !slots) {
      return res.status(400).json({ message: 'Missing required fields: dayOfWeek, slots' });
    }

    const query = {
      businessId: req.activeBusinessId,
      staffId: staffId || null,
      dayOfWeek,
      dateOverride: dateOverride ? new Date(dateOverride) : null
    };

    const update = {
      slots,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    };

    // Upsert the availability setup
    const availability = await Availability.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(availability);
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({ message: 'Failed to save availability.', error: error.message });
  }
});

module.exports = router;
