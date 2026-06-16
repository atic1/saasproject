const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Business = require('../models/business');
const BusinessMember = require('../models/businessMember');
const Service = require('../models/service');
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

    if (!name || !phone || !password || !businessName || !businessType) {
      return res.status(400).json({ message: "Name, phone, password, business name, and business type are required" });
    }

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
      status: "active",
      contact: {
        phone: phone || "9800000000",
        city: "kathmandu"
      },
      subscription: {
        plan: "free_trial",
        status: "trial",
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

    await BusinessMember.create({
      userId: user._id,
      businessId: business._id,
      role: "owner"
    });

    // Auto-seed default services based on business type
    const defaultServices = {
      gym: [
        {
          name: "General Gym Pass",
          description: "All-day access to gym floor and standard equipment.",
          duration: 60,
          price: 500,
          capacity: 15,
          type: "gym_class"
        },
        {
          name: "Personal Training Session",
          description: "1-on-1 fitness coaching with a certified trainer.",
          duration: 60,
          price: 1500,
          capacity: 2,
          type: "gym_class"
        }
      ],
      salon: [
        {
          name: "Standard Haircut & Styling",
          description: "Wash, customized cut, blow-dry, and styling.",
          duration: 30,
          price: 500,
          capacity: 2,
          type: "salon_service"
        },
        {
          name: "Luxury Facial & Massage",
          description: "Deep cleansing facial treatment followed by a head and neck massage.",
          duration: 60,
          price: 1200,
          capacity: 1,
          type: "salon_service"
        }
      ],
      clinic: [
        {
          name: "General Consultation",
          description: "General medical health checkup and medical advice.",
          duration: 20,
          price: 600,
          capacity: 1,
          type: "clinic_consultation"
        },
        {
          name: "Diagnostic Blood Test",
          description: "Comprehensive panel checkup including report review.",
          duration: 30,
          price: 1000,
          capacity: 1,
          type: "clinic_consultation"
        }
      ],
      general: [
        {
          name: "Standard Service Consultation",
          description: "Initial consultation session for general service booking.",
          duration: 30,
          price: 500,
          capacity: 1,
          type: "general"
        }
      ]
    };

    try {
      const servicesToCreate = defaultServices[business.type] || defaultServices.general;
      for (const s of servicesToCreate) {
        await Service.create({
          businessId: business._id,
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.price,
          capacity: s.capacity,
          type: s.type,
          isActive: true
        });
      }
    } catch (err) {
      console.error("Failed to seed default services during registration:", err.message);
    }

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
        platformrole: user.platformrole || 'user',
        memberships: membershipsFormatted
      },
      memberships: membershipsFormatted
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: `A record with this ${field} already exists.`
      });
    }
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
    const { phone, email, username, password } = req.body;

    // Determine identifier: prioritize username, then phone, then email
    const loginIdentifier = username || phone || email;

    if (!loginIdentifier) {
      return res.status(400).json({ message: "Phone, email, or username required" });
    }

    // ----------------------------
    // 🔐 SUPER ADMIN CHECK
    // ----------------------------
    // Super Admin shortcut login (username based)
    if ((loginIdentifier === 'superadmin' || username === 'superadmin') && password === 'superadmin123') {
      const saToken = jwt.sign(
        { id: 'superadmin', platformrole: 'super_admin' },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '30d' }
      );
      return res.json({
        success: true,
        token: saToken,
        user: {
          id: 'superadmin',
          name: 'Super Admin',
          email: 'superadmin@biznepal.com',
          platformrole: 'super_admin',
          memberships: []
        },
        memberships: []
      });
    }

    // ----------------------------
    // 🔐 DEMO ADMIN CHECK
    // ----------------------------
    // Demo Admin shortcut login (username based)
    if ((loginIdentifier === 'admin' || username === 'admin') && password === 'admin123') {
      const demoBusiness = await Business.findOne({ slug: 'fitzone-gym' });
      const anyBusiness = !demoBusiness ? await Business.findOne({}) : null;
      const biz = demoBusiness || anyBusiness;

      if (!biz) {
        return res.status(404).json({
          success: false,
          message: "No businesses exist in the database. Please run seed.js first."
        });
      }

      const token = jwt.sign(
        { id: 'admin', platformrole: 'user' },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '30d' }
      );

      const membershipsFormatted = [
        {
          businessId: biz._id.toString(),
          businessName: biz.name,
          businessType: biz.type,
          role: 'owner'
        }
      ];

      return res.json({
        success: true,
        role: 'owner',
        businessId: biz._id,
        businessName: biz.name,
        token,
        user: {
          id: 'admin',
          name: 'Demo Admin',
          email: 'admin@saas.com',
          platformrole: 'user',
          memberships: membershipsFormatted
        },
        memberships: membershipsFormatted
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

    const primaryMembership = membershipsFormatted[0];

    return res.json({
      success: true,
      role: primaryMembership?.role === 'owner' ? 'owner' : 'staff',
      businessId: primaryMembership?.businessId || null,
      businessName: primaryMembership?.businessName || null,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        platformrole: user.platformrole || 'user',
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
// 🔑 REGISTER CUSTOMER (PORTAL SIGNUP)
//
router.post('/customer/register', async (req, res) => {
  try {
    const { name, phone, email, password, businessId } = req.body;

    if (!name || !phone || !password || !businessId) {
      return res.status(400).json({ message: "Name, phone, password, and businessId are required." });
    }

    // 1. Check if global User exists
    let user = await User.findOne({
      $or: [{ phone }, { email: email || 'never_match_dummy' }]
    });

    if (user) {
      // User credentials already exist. Let's see if they have a Customer record under this business
      const Customer = require('../models/customer');
      let customer = await Customer.findOne({ phone, businessId });
      
      if (customer && customer.userId) {
        return res.status(400).json({ message: "An account with this phone number is already registered for this business." });
      }
      
      // If Customer profile exists without userId, link it
      if (customer) {
        customer.userId = user._id;
        if (email) customer.email = email;
        await customer.save();
      } else {
        // Create new Customer profile for this business
        await Customer.create({
          businessId,
          userId: user._id,
          name,
          phone,
          email,
          status: 'active'
        });
      }
    } else {
      // 2. Create global User
      user = await User.create({
        name,
        phone,
        email,
        password,
        platformrole: "customer"
      });

      // 3. Create or link Customer record
      const Customer = require('../models/customer');
      let customer = await Customer.findOne({ phone, businessId });
      if (customer) {
        customer.userId = user._id;
        if (email) customer.email = email;
        await customer.save();
      } else {
        await Customer.create({
          businessId,
          userId: user._id,
          name,
          phone,
          email,
          status: 'active'
        });
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Customer registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberships: []
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: `A record with this ${field} already exists.`
      });
    }
    res.status(500).json({
      message: "Server error during customer registration",
      error: error.message
    });
  }
});

module.exports = router;
