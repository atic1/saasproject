const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const BusinessMember = require('../models/businessMember');
const jwt = require('jsonwebtoken');

router.post('/select-business', protect, async (req, res) => {
  try {
    const { businessId } = req.body;

    const membership = await BusinessMember.findOne({
      userId: req.user._id,
      businessId
    }).populate('businessId');

    if (!membership) {
      return res.status(403).json({
        message: 'No access to this business'
      });
    }

    // Re-issue token with active business
    const token = jwt.sign(
      {
        id: req.user._id,
        platformrole: req.user.platformrole,
        activeBusinessId: businessId
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      activeBusiness: {
        id: membership.businessId._id,
        name: membership.businessId.name,
        type: membership.businessId.type,
        role: membership.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;