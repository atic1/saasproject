const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post("/select-business", protect, async (req, res) => {
  try {
    const { businessId } = req.body;

    const membership = req.memberships.find(
      m => m.businessId._id.toString() === businessId
    );

    if (!membership) {
      return res.status(403).json({ message: "No access to this business" });
    }

    res.json({
      activeBusiness: {
        businessId: membership.businessId._id.toString(),
        businessName: membership.businessId.name,
        businessType: membership.businessId.type,
        role: membership.role
      },
      role: membership.role
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;