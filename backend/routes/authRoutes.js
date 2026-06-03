const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Business = require('../models/business');
const BusinessMember = require('../models/businessMember');

//
// 🔐 TOKEN GENERATOR
//
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '30d' }
  );
};

//
// 🟢 REGISTER (creates global user + business + membership)
//
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, businessName, businessType } = req.body;

    // 1. Check user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create User (global identity)
    const user = await User.create({
      name,
      phone,
      password,
      platformrole: 'customer'
    });

    // 3. Create Business
    const business = await Business.create({
      name: businessName,
      slug: businessName.toLowerCase().replace(/\s+/g, '-'),
      type: businessType,
      contact: {
        phone
      }
    });

    // 4. Create Membership (OWNER)
    await BusinessMember.create({
      userId: user._id,
      businessId: business._id,
      role: 'owner'
    });

    // 5. Return JWT + memberships
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone
      },
      memberships: [
        {
          businessId: business._id,
          businessName: business.name,
          businessType: business.type,
          role: 'owner'
        }
      ]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//
// 🔑 LOGIN (real SaaS login)
//
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Get memberships
    const memberships = await BusinessMember.find({
      userId: user._id
    }).populate('businessId');

    // 4. Format response
    const formatted = memberships.map(m => ({
      businessId: m.businessId._id,
      businessName: m.businessId.name,
      businessType: m.businessId.type,
      role: m.role
    }));

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        platformrole: user.platformrole
      },
      memberships: formatted
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;