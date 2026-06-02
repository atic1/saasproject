const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Business = require('../models/business');
const BusinessMember = require('../models/businessMember');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// Register User
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      businessName,
      businessType,
      slug
    } = req.body;

    // 1. Check global user (NO businessId anymore)
    let user = await User.findOne({ phone });

    if (user) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 2. Create USER (GLOBAL)
    user = await User.create({
      name,
      phone,
      email,
      password,
      platformrole: "customer"
    });

    // 3. Create BUSINESS
    const business = await Business.create({
      name: businessName,
      type: businessType,
      slug,
      ownerId: user._id,
      status: "pending_verification",
      contact: {
        phone: phone || "9800000000",
        city: "kathmandu"
      }
    });

    // 4. Create BUSINESS MEMBER (OWNER ROLE)
    await BusinessMember.create({
      userId: user._id,
      businessId: business._id,
      role: "owner"
    });

    // 5. Generate token
    const token = generateToken(user._id);

    const membershipsFormatted = [
      {
        businessId: business._id.toString(),
        businessName: business.name,
        businessType: business.type,
        role: "owner"
      }
    ];

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberships: membershipsFormatted
      },
      memberships: membershipsFormatted
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    const loginIdentifier = phone || email;

    if (!loginIdentifier) {
      return res.status(400).json({ message: "Phone or email required" });
    }

    // 1. Find GLOBAL user
    const user = await User.findOne({
      $or: [
        { phone: loginIdentifier },
        { email: loginIdentifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Get all businesses user belongs to
    const memberships = await BusinessMember.find({ userId: user._id })
      .populate("businessId");

    // 4. Format memberships
    const membershipsFormatted = memberships
      .filter(m => m.businessId) // Ensure business exists
      .map(m => ({
        businessId: m.businessId._id.toString(),
        businessName: m.businessId.name,
        businessType: m.businessId.type,
        role: m.role
      }));

    // 5. Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberships: membershipsFormatted
      },
      memberships: membershipsFormatted
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;