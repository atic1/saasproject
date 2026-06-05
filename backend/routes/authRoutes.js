const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Business = require('../models/business');
const BusinessMember = require('../models/businessMember');
const jwt = require('jsonwebtoken');

//
// 🔐 JWT GENERATOR
//
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '30d' }
  );
};

//
// 🟢 REGISTER USER (SaaS MULTI-TENANT)
//
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

    const existingUser = await User.findOne({
      $or: [{ phone }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      phone,
      email,
      password,
      platformrole: "customer"
    });

    const business = await Business.create({
      name: businessName,
      type: businessType,
      slug: slug || businessName.toLowerCase().replace(/\s+/g, '-'),
      ownerId: user._id,
      status: "pending_verification",
      contact: {
        phone: phone || "9800000000",
        city: "kathmandu"
      }
    });

    await BusinessMember.create({
      userId: user._id,
      businessId: business._id,
      role: "owner"
    });

    const token = generateToken(user._id);

    const membershipsFormatted = [
      {
        businessId: business._id.toString(),
        businessName: business.name,
        businessType: business.type,
        role: "owner"
      }
    ];

    return res.status(201).json({
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
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

//
// 🔑 LOGIN (MULTI-TENANT SAAS LOGIN)
//
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    const loginIdentifier = phone || email;

    if (!loginIdentifier) {
      return res.status(400).json({ message: "Phone or email required" });
    }

    // ----------------------------
    // 🔐 SUPER ADMIN CHECK
    // ----------------------------
    if (loginIdentifier === 'superadmin' && password === 'superadmin123') {
      return res.json({
        success: true,
        role: 'super_admin',
        businessId: 'superadmin',
        businessName: 'BizNepal Super Admin'
      });
    }

    // ----------------------------
    // 🔐 DEMO ADMIN CHECK
    // ----------------------------
    if (loginIdentifier === 'admin' && password === 'admin123') {

      const demoBusiness = await Business.findOne({ slug: 'fitzone-gym' });

      if (!demoBusiness) {
        const anyBusiness = await Business.findOne({});

        if (!anyBusiness) {
          return res.status(404).json({
            success: false,
            message: "No businesses exist in the database. Please run seed.js first."
          });
        }

        return res.json({
          success: true,
          role: 'owner',
          businessId: anyBusiness._id,
          businessName: anyBusiness.name
        });
      }

      return res.json({
        success: true,
        role: 'owner',
        businessId: demoBusiness._id,
        businessName: demoBusiness.name
      });
    }

    // ----------------------------
    // 🔑 NORMAL LOGIN FLOW
    // ----------------------------
    const user = await User.findOne({
      $or: [
        { phone: loginIdentifier },
        { email: loginIdentifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const memberships = await BusinessMember.find({ userId: user._id })
      .populate("businessId");

    const membershipsFormatted = memberships
      .filter(m => m.businessId)
      .map(m => ({
        businessId: m.businessId._id.toString(),
        businessName: m.businessId.name,
        businessType: m.businessId.type,
        role: m.role
      }));

    const token = generateToken(user._id);

    return res.json({
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
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;