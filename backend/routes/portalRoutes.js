const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Business = require('../models/business');
const Service = require('../models/service');
const Availability = require('../models/availability');
const Booking = require('../models/booking');
const Customer = require('../models/customer');
const Invoice = require('../models/invoice');
const User = require('../models/user');
const BusinessMember = require('../models/businessMember');
const Plan = require('../models/plan');
const Offer = require('../models/offer');
const Trainer = require('../models/trainer');

const { protect } = require('../middleware/authMiddleware');

/**
 * Helper: Convert time string ("HH:MM") to minutes
 */
const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Helper: Convert minutes to time string ("HH:MM")
 */
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Helper: Check if two time slots overlap
 */
const timesOverlap = (s1Mins, e1Mins, s2Mins, e2Mins) => {
  return s1Mins < e2Mins && s2Mins < e1Mins;
};

/**
 * @route   GET /api/portal/business/:slug
 * @desc    Resolve business branding, settings, schedule
 * @access  Public
 */
router.get('/business/:slug', async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/portal/business/:slug/services
 * @desc    List active services for a business
 * @access  Public
 */
router.get('/business/:slug/services', async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const services = await Service.find({ businessId: business._id, isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/portal/business/:slug/staff
 * @desc    List staff members for a business
 * @access  Public
 */
router.get('/business/:slug/staff', async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Find all BusinessMembers of role staff/trainer/stylist/doctor
    const members = await BusinessMember.find({
      businessId: business._id,
      role: { $in: ['staff', 'trainer', 'doctor', 'stylist', 'owner', 'manager'] }
    }).populate('userId', 'name email phone avatarUrl');

    const staffList = members
      .filter(m => m.userId)
      .map(m => ({
        id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        phone: m.userId.phone,
        role: m.role,
        avatarUrl: m.userId.avatarUrl
      }));

    res.json(staffList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/portal/business/:slug/availability
 * @desc    Query open bookable slots for a business/staff on a given date
 * @access  Public
 */
router.get('/business/:slug/availability', async (req, res) => {
  try {
    const { date, serviceId, staffId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ message: 'date and serviceId are required query parameters' });
    }

    const business = await Business.findOne({ slug: req.params.slug });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const service = await Service.findOne({ _id: serviceId, businessId: business._id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayOfWeek = days[targetDate.getDay()];

    // 1. Resolve Availability Timetable
    // Check specific date override, then staff day of week, then business day of week
    let schedule = await Availability.findOne({
      businessId: business._id,
      staffId: staffId || null,
      dateOverride: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!schedule) {
      schedule = await Availability.findOne({
        businessId: business._id,
        staffId: staffId || null,
        dayOfWeek,
        dateOverride: null
      });
    }

    if (!schedule && staffId) {
      // fallback to general business schedule
      schedule = await Availability.findOne({
        businessId: business._id,
        staffId: null,
        dayOfWeek,
        dateOverride: null
      });
    }

    let operatingSlots = [];
    let capacity = service.capacity || 1;

    if (schedule) {
      if (!schedule.isAvailable) {
        return res.json([]); // unavailable (e.g. holiday)
      }
      operatingSlots = schedule.slots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity || capacity
      }));
    } else {
      // Fallback to Business hours in business timings
      if (business.timings && business.timings.schedule && business.timings.schedule.length > 0) {
        const daySchedule = business.timings.schedule.find(s => s.day === dayOfWeek);
        if (daySchedule) {
          if (daySchedule.isOpen) {
            operatingSlots = [{
              startTime: daySchedule.open || "09:00",
              endTime: daySchedule.close || "17:00",
              capacity: capacity
            }];
          } else {
            return res.json([]); // closed
          }
        } else {
          // day not configured in schedule, fallback to default hours
          operatingSlots = [{ startTime: "09:00", endTime: "17:00", capacity: capacity }];
        }
      } else {
        // Default default hours
        operatingSlots = [{ startTime: "09:00", endTime: "17:00", capacity: capacity }];
      }
    }

    // 2. Fetch existing bookings for this day
    const bookingQuery = {
      businessId: business._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] }
    };

    if (staffId) {
      bookingQuery.staffId = staffId;
    }

    const bookings = await Booking.find(bookingQuery);

    // 3. Generate candidate slots (every 30 mins, duration = service.duration)
    const availableSlots = [];
    const serviceDuration = service.duration; // in minutes

    for (const opSlot of operatingSlots) {
      const opStart = timeToMinutes(opSlot.startTime);
      const opEnd = timeToMinutes(opSlot.endTime);
      const maxSlotCapacity = opSlot.capacity || capacity;

      // Slide a window of serviceDuration across the operating hours
      for (let start = opStart; start + serviceDuration <= opEnd; start += 30) {
        const end = start + serviceDuration;
        const startTimeStr = minutesToTime(start);
        const endTimeStr = minutesToTime(end);

        // Count overlapping bookings
        let bookingOverlapCount = 0;
        for (const booking of bookings) {
          const bStart = timeToMinutes(booking.startTime);
          const bEnd = timeToMinutes(booking.endTime);
          if (timesOverlap(start, end, bStart, bEnd)) {
            bookingOverlapCount++;
          }
        }

        // If the number of bookings is less than capacity, slot is available
        if (bookingOverlapCount < maxSlotCapacity) {
          availableSlots.push({
            startTime: startTimeStr,
            endTime: endTimeStr,
            availableCapacity: maxSlotCapacity - bookingOverlapCount
          });
        }
      }
    }

    res.json(availableSlots);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/portal/bookings
 * @desc    Create a self-service customer booking
 * @access  Private (Customer JWT)
 */
router.post('/bookings', protect, async (req, res) => {
  try {
    const { businessId, serviceId, staffId, date, startTime, customerNotes } = req.body;

    if (!businessId || !serviceId || !date || !startTime) {
      return res.status(400).json({ message: 'businessId, serviceId, date, and startTime are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    const service = await Service.findOne({ _id: serviceId, businessId });
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Resolve end time from service duration
    const startMins = timeToMinutes(startTime);
    const endMins = startMins + service.duration;
    const endTime = minutesToTime(endMins);

    // Resolve staff name if staffId provided
    let staffName = '';
    if (staffId) {
      const staffUser = await User.findById(staffId);
      if (staffUser) {
        staffName = staffUser.name;
      }
    }

    // Find or create Customer record for this user under this business
    let customer = await Customer.findOne({ userId: req.user._id, businessId });
    if (!customer) {
      // Find by phone number to link if existing CRM walk-in exists
      customer = await Customer.findOne({ phone: req.user.phone, businessId });
      if (customer) {
        customer.userId = req.user._id;
        await customer.save();
      } else {
        customer = await Customer.create({
          businessId,
          userId: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          email: req.user.email,
          status: 'active'
        });
      }
    }

    const { checkConflict, checkStaffAvailability } = require('../controllers/bookingController');

    const availabilityCheck = await checkStaffAvailability(businessId, {
      date,
      startTime,
      endTime,
      staffId
    });

    if (!availabilityCheck.available) {
      return res.status(400).json({
        message: 'Availability validation failed',
        reason: availabilityCheck.reason
      });
    }

    const conflictCheck = await checkConflict(businessId, {
      date,
      startTime,
      endTime,
      staffId,
      serviceId,
      serviceCapacity: service.capacity || 1
    });

    if (conflictCheck.conflict) {
      return res.status(409).json({ message: 'Booking conflict', reason: conflictCheck.reason });
    }

    // 2. Create booking
    const booking = new Booking({
      businessId,
      customerId: customer._id,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      type: service.type === 'gym_class' ? 'class' : 'appointment',
      serviceId,
      serviceName: service.name,
      staffId: staffId || undefined,
      staffName: staffName || undefined,
      date: new Date(date),
      startTime,
      endTime,
      duration: service.duration,
      customerNotes,
      status: 'pending',
      createdBy: req.user._id
    });

    await booking.save();

    // 3. Create Invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const invoice = new Invoice({
      businessId,
      customerId: customer._id,
      bookingId: booking._id,
      invoiceNumber,
      amount: service.price,
      tax: 0,
      discount: 0,
      total: service.price,
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days due
    });
    await invoice.save();

    res.status(201).json({
      message: 'Booking created successfully.',
      booking,
      invoice
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/portal/bookings
 * @desc    Get customer's own booking history
 * @access  Private (Customer JWT)
 */
router.get('/bookings', protect, async (req, res) => {
  try {
    // Find all Customer records for this user across all businesses
    const customerProfiles = await Customer.find({ userId: req.user._id });
    const customerIds = customerProfiles.map(c => c._id);

    const bookings = await Booking.find({ customerId: { $in: customerIds } })
      .populate('businessId', 'name type slug')
      .populate('staffId', 'name email')
      .sort({ date: -1, startTime: -1 });

    // Fetch invoices for these bookings
    const bookingIds = bookings.map(b => b._id);
    const invoices = await Invoice.find({ bookingId: { $in: bookingIds } });

    // Attach invoices to bookings
    const bookingsWithInvoices = bookings.map(b => {
      const bObj = b.toObject();
      bObj.invoice = invoices.find(inv => inv.bookingId && inv.bookingId.toString() === b._id.toString());
      return bObj;
    });

    res.json(bookingsWithInvoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/portal/invoices/:id
 * @desc    Get single invoice detail
 * @access  Private (Customer JWT)
 */
router.get('/invoices/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('businessId', 'name type slug contact')
      .populate('customerId', 'name phone email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // Verify ownership
    const customer = await Customer.findById(invoice.customerId);
    if (!customer || !customer.userId || customer.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/portal/business/:slug/public-site
 * @desc    Get all dynamic content required for the public website of a gym
 * @access  Public
 */
router.get('/business/:slug/public-site', async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug.toLowerCase() });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.status !== 'active') {
      return res.status(403).json({ message: 'Business is inactive' });
    }

    const businessIdStr = business._id.toString();

    // Query active plans, active offers, and all trainers
    const [plans, offers, trainers] = await Promise.all([
      Plan.find({ businessId: businessIdStr, isActive: true }).sort({ 'display.order': 1 }),
      Offer.find({ businessId: businessIdStr, isActive: true }).sort({ createdAt: -1 }),
      Trainer.find({ businessId: businessIdStr }).sort({ createdAt: -1 })
    ]);

    res.json({
      business,
      plans,
      offers,
      trainers
    });
  } catch (error) {
    console.error('Error fetching public site data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/portal/membership/purchase
 * @desc    Purchase a membership plan and generate an invoice
 * @access  Private (Customer JWT)
 */
router.post('/membership/purchase', protect, async (req, res) => {
  try {
    const { businessId, planId } = req.body;
    if (!businessId || !planId) {
      return res.status(400).json({ message: 'businessId and planId are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    const plan = await Plan.findOne({ _id: planId, businessId });
    if (!plan) {
      return res.status(404).json({ message: 'Membership plan not found or mismatch.' });
    }

    // Resolve or create Customer profile
    let customer = await Customer.findOne({ userId: req.user._id, businessId });
    if (!customer) {
      customer = await Customer.findOne({ phone: req.user.phone, businessId });
      if (customer) {
        customer.userId = req.user._id;
        await customer.save();
      } else {
        customer = await Customer.create({
          businessId,
          userId: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          email: req.user.email,
          status: 'active'
        });
      }
    }

    // Create Invoice for membership plan
    const invoiceNumber = `INV-MEM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const invoice = new Invoice({
      businessId,
      customerId: customer._id,
      planId: plan._id,
      invoiceNumber,
      amount: plan.pricing.basePrice,
      tax: 0,
      discount: 0,
      total: plan.pricing.basePrice,
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days due
    });
    await invoice.save();

    res.status(201).json({
      message: 'Plan purchase initiated. Invoice generated.',
      invoice
    });
  } catch (error) {
    console.error('Plan purchase error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/portal/profile
 * @desc    Update customer profile details (name, email, phone)
 * @access  Private (Customer JWT)
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone) {
      // Validate phone format
      if (!/^98\d{8}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be a valid Nepalese number starting with 98 (10 digits)' });
      }
      // Check phone uniqueness
      const existing = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
      user.phone = phone;
    }

    await user.save();

    // Update matching customer profiles
    const customerUpdates = {};
    if (name) customerUpdates.name = name;
    if (email !== undefined) customerUpdates.email = email;
    if (phone) customerUpdates.phone = phone;

    await Customer.updateMany({ userId: user._id }, { $set: customerUpdates });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        platformrole: user.platformrole || 'customer',
        memberships: []
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/portal/customer/:customerId
 * @desc    Fetch customer specific portal details: customer, business, bookings, invoices
 * @access  Public
 */
router.get('/customer/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId)
      .populate('membership.planId');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const business = await Business.findById(customer.businessId);
    if (!business) {
      return res.status(404).json({ message: 'Associated business not found' });
    }

    // Fetch bookings for this customer
    const bookings = await Booking.find({ customerId: customer._id })
      .populate('serviceId')
      .populate('staffId', 'name email phone')
      .sort({ date: -1, startTime: -1 });

    // Fetch invoices for this customer
    const invoices = await Invoice.find({ customerId: customer._id })
      .populate('planId')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({
      customer,
      business,
      bookings,
      invoices
    });
  } catch (error) {
    console.error('Customer portal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
