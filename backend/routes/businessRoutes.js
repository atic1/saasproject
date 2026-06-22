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

// @route   PATCH /api/businesses/:id/features
// @desc    Update feature flags for a business (tenant owner only)
// @access  Private
router.patch('/:id/features', protect, enforceTenant, async (req, res) => {
  try {
    const Business = require('../models/business');
    const businessId = req.params.id;

    // Ensure the requesting user owns this business
    if (req.activeBusinessId?.toString() !== businessId) {
      return res.status(403).json({ message: 'Access denied: business mismatch.' });
    }

    const { features } = req.body;
    if (!features || typeof features !== 'object') {
      return res.status(400).json({ message: 'features object is required.' });
    }

    // Only whitelist known feature keys — prevent arbitrary field injection
    const ALLOWED_FEATURES = [
      'booking','inventory','staffManagement','customerPortal','posBilling',
      'analytics','multiBranch','customDomain',
      // Gym Module 1
      'memberProfiles','membershipTiers','attendanceTracking','equipmentTracker',
      // Gym Module 2
      'classScheduler','personalTrainerBooking','waitlistManagement','qrCheckIn',
      // Gym Module 3
      'autoRenewalBilling','promoDiscounts','onlinePayments','invoiceHistory',
      // Gym Module 4
      'workoutPlans','bodyMetrics','loyaltyRewards','smsEmailAlerts',
      // Gym Module 5
      'gymStore','nutritionPlans','reportsExport',
    ];

    const sanitized = {};
    ALLOWED_FEATURES.forEach(key => {
      if (key in features) sanitized[key] = !!features[key];
    });

    const updated = await Business.findByIdAndUpdate(
      businessId,
      { $set: Object.fromEntries(Object.entries(sanitized).map(([k, v]) => [`features.${k}`, v])) },
      { new: true, runValidators: false }
    );

    if (!updated) return res.status(404).json({ message: 'Business not found.' });

    res.json({ message: 'Features updated successfully.', features: updated.features });
  } catch (error) {
    console.error('Error updating features:', error);
    res.status(500).json({ message: 'Failed to update features.' });
  }
});

module.exports = router;
