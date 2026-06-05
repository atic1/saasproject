const express = require('express');
const router = express.Router();
const { registerBusiness, getCurrentBusiness, updateCurrentBusiness } = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');

// @route   POST /api/businesses/register
// @desc    Register a new business
// @access  Public
router.post('/register', registerBusiness);

// @route   GET /api/businesses/current
// @desc    Get current business details
// @access  Private
router.get('/current', protect, enforceTenant, requirePermission('business.read'), getCurrentBusiness);

// @route   PUT /api/businesses/current
// @desc    Update current business details
// @access  Private
router.put('/current', protect, enforceTenant, requirePermission('business.update'), updateCurrentBusiness);

// @route   GET /api/businesses/current/staff
// @desc    Get all staff members of the current business
// @access  Private
router.get('/current/staff', protect, enforceTenant, async (req, res) => {
  try {
    const BusinessMember = require('../models/businessMember');
    const members = await BusinessMember.find({
      businessId: req.activeBusinessId,
      role: { $ne: 'customer' }
    }).populate('userId', 'name email phone');

    const staff = members.map(m => ({
      _id: m.userId?._id,
      name: m.userId?.name,
      email: m.userId?.email,
      phone: m.userId?.phone,
      role: m.role
    }));

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Failed to fetch staff.' });
  }
});

module.exports = router;
