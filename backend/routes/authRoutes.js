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
      slug,
      city,
      address,
      panVat,
      registrationDoc
    } = req.body;

    if (!name || !phone || !password || !businessName || !businessType) {
      return res.status(400).json({ message: "Name, phone, password, business name, and business type are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (!/^98\d{8}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must be a valid 10-digit Nepali number starting with 98" });
    }

    const existingUser = await User.findOne({
      $or: [{ phone }, { email: email || 'never_match_dummy@biznepal.com' }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this phone or email" });
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
      slug: slug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      ownerId: user._id,
      status: "pending",
      contact: {
        phone: phone || "9800000000",
        email: email,
        city: city || "kathmandu",
        address: address || ""
      },
      details: {
        panVat: panVat || "",
        registrationDoc: registrationDoc || null
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

    // Send congratulatory email
    try {
      const { sendCongratulatoryEmail } = require('../services/emailService');
      if (email) {
        await sendCongratulatoryEmail(email, businessName, name);
      }
    } catch (emailErr) {
      console.error("Failed to send registration congratulatory email:", emailErr.message);
    }

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
        businessStatus: business.status,
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
    // 🔐 DEMO ADMIN CHECK (GYM)
    // ----------------------------
    if ((loginIdentifier === 'admin' || username === 'admin' || email === 'gym-owner@fitzone.com') && password === 'admin123') {
      const demoBusiness = await Business.findOne({ slug: 'fitzone-gym' }) || await Business.findOne({ type: 'gym' }) || await Business.findOne({});

      if (!demoBusiness) {
        return res.status(404).json({
          success: false,
          message: "No businesses exist in the database."
        });
      }

      const token = jwt.sign(
        { id: 'admin', platformrole: 'user' },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '30d' }
      );

      const membershipsFormatted = [
        {
          businessId: demoBusiness._id.toString(),
          businessName: demoBusiness.name,
          businessType: demoBusiness.type,
          role: 'owner'
        }
      ];

      return res.json({
        success: true,
        role: 'owner',
        businessId: demoBusiness._id,
        businessName: demoBusiness.name,
        token,
        user: {
          id: 'admin',
          name: 'Alex Rivera',
          email: 'gym-owner@fitzone.com',
          platformrole: 'user',
          memberships: membershipsFormatted
        },
        memberships: membershipsFormatted
      });
    }

    // ----------------------------
    // 🔐 DEMO SALON ADMIN CHECK
    // ----------------------------
    if ((loginIdentifier === 'salonadmin' || username === 'salonadmin' || email === 'salon-owner@glow.com') && password === 'salon123') {
      const demoBusiness = await Business.findOne({ slug: 'glow-beauty' }) || await Business.findOne({ type: 'salon' }) || await Business.findOne({});

      if (!demoBusiness) {
        return res.status(404).json({
          success: false,
          message: "No salon business found in database."
        });
      }

      const token = jwt.sign(
        { id: 'salonadmin', platformrole: 'user' },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '30d' }
      );

      const membershipsFormatted = [
        {
          businessId: demoBusiness._id.toString(),
          businessName: demoBusiness.name,
          businessType: demoBusiness.type,
          role: 'owner'
        }
      ];

      return res.json({
        success: true,
        role: 'owner',
        businessId: demoBusiness._id,
        businessName: demoBusiness.name,
        token,
        user: {
          id: 'salonadmin',
          name: 'Chloe Vane',
          email: 'salon-owner@glow.com',
          platformrole: 'user',
          memberships: membershipsFormatted
        },
        memberships: membershipsFormatted
      });
    }

    // ----------------------------
    // 🔐 DEMO CLINIC ADMIN CHECK
    // ----------------------------
    if ((loginIdentifier === 'clinicadmin' || username === 'clinicadmin' || email === 'clinic-owner@smile.com') && password === 'clinic123') {
      const demoBusiness = await Business.findOne({ slug: 'smile-dental' }) || await Business.findOne({ type: 'clinic' }) || await Business.findOne({});

      if (!demoBusiness) {
        return res.status(404).json({
          success: false,
          message: "No clinic business found in database."
        });
      }

      const token = jwt.sign(
        { id: 'clinicadmin', platformrole: 'user' },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '30d' }
      );

      const membershipsFormatted = [
        {
          businessId: demoBusiness._id.toString(),
          businessName: demoBusiness.name,
          businessType: demoBusiness.type,
          role: 'owner'
        }
      ];

      return res.json({
        success: true,
        role: 'owner',
        businessId: demoBusiness._id,
        businessName: demoBusiness.name,
        token,
        user: {
          id: 'clinicadmin',
          name: 'Dr. Marcus Vance',
          email: 'clinic-owner@smile.com',
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
        businessStatus: m.businessId.status,
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
    const { name, phone, email, password, businessId, selectedServiceId, serviceId } = req.body;
    const targetServiceId = selectedServiceId || serviceId;

    if (!name || !phone || !password || !businessId) {
      return res.status(400).json({ message: "Name, phone, password, and businessId are required." });
    }

    const Customer = require('../models/customer');
    const Booking = require('../models/booking');
    const Service = require('../models/service');
    const GymService = require('../models/gymService');

    // 1. Check if global User exists
    let user = await User.findOne({
      $or: [{ phone }, { email: email || 'never_match_dummy' }]
    });

    let customerObj = null;

    if (user) {
      // User credentials already exist. Let's see if they have a Customer record under this business
      let customer = await Customer.findOne({ phone, businessId });
      
      if (customer && customer.userId) {
        return res.status(400).json({ message: "An account with this phone number is already registered for this business." });
      }
      
      // If Customer profile exists without userId, link it
      if (customer) {
        customer.userId = user._id;
        if (email) customer.email = email;
        await customer.save();
        customerObj = customer;
      } else {
        // Create new Customer profile for this business
        customerObj = await Customer.create({
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
      let customer = await Customer.findOne({ phone, businessId });
      if (customer) {
        customer.userId = user._id;
        if (email) customer.email = email;
        await customer.save();
        customerObj = customer;
      } else {
        customerObj = await Customer.create({
          businessId,
          userId: user._id,
          name,
          phone,
          email,
          status: 'active'
        });
      }
    }

    // If customer selected a service during registration, auto-create a pending booking/subscription
    if (targetServiceId && customerObj) {
      try {
        let serviceObj = await Service.findById(targetServiceId);
        let serviceName = serviceObj ? serviceObj.name : 'Selected Service';
        let duration = serviceObj ? serviceObj.duration : 60;
        let price = serviceObj ? serviceObj.price : 0;

        if (!serviceObj) {
          const gymSvc = await GymService.findById(targetServiceId);
          if (gymSvc) {
            serviceName = gymSvc.serviceName;
          }
        }

        const todayStr = new Date().toISOString().split('T')[0];
        await Booking.create({
          businessId,
          customerId: customerObj._id,
          serviceId: targetServiceId,
          serviceName,
          date: todayStr,
          startTime: "10:00",
          endTime: "11:00",
          duration,
          totalAmount: price,
          paymentStatus: 'unpaid',
          status: 'pending',
          customerNotes: `Auto-registered via signup service selection (${serviceName})`
        });
      } catch (svcErr) {
        console.error("Failed to auto-create booking for selected service:", svcErr.message);
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
      },
      selectedServiceId: targetServiceId || null
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
