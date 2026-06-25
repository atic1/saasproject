const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Business      = require('../models/business');
const GymWebsite    = require('../models/gymWebsite');
const MembershipPlan = require('../models/membershipPlan');
const Trainer       = require('../models/trainer');
const GymService    = require('../models/gymService');
const Gallery       = require('../models/gallery');
const Review        = require('../models/review');
const Offer         = require('../models/offer');
const User          = require('../models/user');
const BusinessMember = require('../models/businessMember');

const { protect } = require('../middleware/authMiddleware');

// ============================================================
//  LIGHTWEIGHT PROTECT — works for both real users AND the
//  demo 'admin' shortcut token (which has id:'admin', not a
//  real ObjectId). Falls back to X-Business-Id header.
// ============================================================
const protectGymWebsite = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    // Try to find a real user in DB
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (_) { /* decoded.id may not be a valid ObjectId (demo token) */ }

    if (user) {
      // Real user path — mirror what protect does
      const memberships = await BusinessMember.find({ userId: user._id }).populate('businessId');
      req.user = user;
      req.memberships = memberships;
    } else {
      // Demo token path (id === 'admin' etc.) — trust the header
      req.user = { id: decoded.id, name: 'Demo Admin', platformrole: decoded.platformrole || 'user' };
    }

    // Always resolve activeBusinessId from header (most reliable)
    const headerBid = req.headers['x-business-id'];
    if (headerBid) req.activeBusinessId = headerBid;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// ============================================================
//  HELPER — get active businessId from JWT context
// ============================================================
const getBusinessId = (req) =>
  req.activeBusinessId ||
  req.body?.businessId ||
  req.query?.businessId ||
  req.headers['x-business-id'];

// ============================================================
//  RESERVED SLUGS — cannot be registered as a gym URL
// ============================================================
const RESERVED_SLUGS = new Set([
  'login', 'register', 'app', 'superadmin', 'super-admin',
  'api', 'features', 'pricing', 'contact', 'admin',
  'dashboard', 'payment-success', 'payment-failed', 'payment-pending'
]);

// ==============================================================
//  PUBLIC ROUTE — GET /api/public/gym/:slug
//  No auth required. Returns all public website data.
// ==============================================================
router.get('/public/gym/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();

    if (RESERVED_SLUGS.has(slug)) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Find the business by slug
    const business = await Business.findOne({ slug, status: 'active' });
    if (!business) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const bid = business._id;

    // Fetch all associated data in parallel
    const now = new Date();
    const [gymWebsite, plans, trainers, services, gallery, reviews, offers] = await Promise.all([
      GymWebsite.findOne({ businessId: bid }),
      MembershipPlan.find({ businessId: bid, isActive: true }).sort({ price: 1 }),
      Trainer.find({ businessId: bid, isActive: true }),
      GymService.find({ businessId: bid, isActive: true }),
      Gallery.find({ businessId: bid }).sort({ createdAt: -1 }).limit(20),
      Review.find({ businessId: bid, isApproved: true }).sort({ createdAt: -1 }).limit(20),
      Offer.find({
        businessId: bid.toString(),
        isActive: true,
        'validity.startDate': { $lte: now },
        'validity.endDate':   { $gte: now }
      }).sort({ createdAt: -1 }).limit(10)
    ]);

    return res.json({
      business: {
        id: business._id,
        name: business.name,
        type: business.type,
        slug: business.slug,
        branding: business.branding,
        contact: business.contact
      },
      gymWebsite: gymWebsite || {},
      plans,
      trainers,
      services,
      gallery,
      reviews,
      offers
    });
  } catch (err) {
    console.error('Public gym fetch error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ==============================================================
//  PROTECTED — ALL ROUTES BELOW REQUIRE JWT
// ==============================================================

// ------ GYM WEBSITE BASIC INFO ------

// GET /api/gym-website  — get current business website settings
router.get('/gym-website', protect, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });

    let gymWebsite = await GymWebsite.findOne({ businessId });
    if (!gymWebsite) {
      // Auto-create an empty record
      gymWebsite = await GymWebsite.create({ businessId });
    }
    return res.json(gymWebsite);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/gym-website  — update basic info + social links + business hours
router.put('/gym-website', protect, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });

    const allowedFields = [
      'logo', 'coverImage', 'description', 'mission', 'facilities',
      'address', 'phone', 'email', 'mapLink',
      'socialLinks', 'businessHours', 'isPublished'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    updateData.updatedAt = new Date();

    const gymWebsite = await GymWebsite.findOneAndUpdate(
      { businessId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ message: 'Website info updated', gymWebsite });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ------ MEMBERSHIP PLANS ------

// GET /api/gym-website/plans
router.get('/gym-website/plans', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });
    const plans = await MembershipPlan.find({ businessId }).sort({ price: 1 });
    return res.json(plans);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/gym-website/plans
router.post('/gym-website/plans', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });

    const { name, price, duration, description, isPopular } = req.body;
    if (!name || price === undefined || !duration) {
      return res.status(400).json({ message: 'name, price, and duration are required' });
    }

    const plan = await MembershipPlan.create({
      businessId, name, price, duration, description, isPopular
    });
    return res.status(201).json(plan);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/gym-website/plans/:id
router.put('/gym-website/plans/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const plan = await MembershipPlan.findOneAndUpdate(
      { _id: req.params.id, businessId },
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    return res.json(plan);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/gym-website/plans/:id
router.delete('/gym-website/plans/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const plan = await MembershipPlan.findOneAndDelete({ _id: req.params.id, businessId });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    return res.json({ message: 'Plan deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ------ TRAINERS ------

// GET /api/gym-website/trainers
router.get('/gym-website/trainers', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });
    const trainers = await Trainer.find({ businessId });
    return res.json(trainers);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/gym-website/trainers
router.post('/gym-website/trainers', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });

    const { name, photo, specialization, experience, bio } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ message: 'name and specialization are required' });
    }

    const trainer = await Trainer.create({
      businessId, name, photo, specialization, experience, bio
    });
    return res.status(201).json(trainer);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/gym-website/trainers/:id
router.put('/gym-website/trainers/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const trainer = await Trainer.findOneAndUpdate(
      { _id: req.params.id, businessId },
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    return res.json(trainer);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/gym-website/trainers/:id
router.delete('/gym-website/trainers/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const trainer = await Trainer.findOneAndDelete({ _id: req.params.id, businessId });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    return res.json({ message: 'Trainer deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ------ SERVICES ------

// GET /api/gym-website/services
router.get('/gym-website/services', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });
    const services = await GymService.find({ businessId });
    return res.json(services);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/gym-website/services
router.post('/gym-website/services', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });

    const { serviceName, description, icon } = req.body;
    if (!serviceName) return res.status(400).json({ message: 'serviceName is required' });

    const service = await GymService.create({ businessId, serviceName, description, icon });
    return res.status(201).json(service);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/gym-website/services/:id
router.put('/gym-website/services/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const service = await GymService.findOneAndUpdate(
      { _id: req.params.id, businessId },
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json(service);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/gym-website/services/:id
router.delete('/gym-website/services/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const service = await GymService.findOneAndDelete({ _id: req.params.id, businessId });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json({ message: 'Service deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ------ GALLERY ------

// GET /api/gym-website/gallery
router.get('/gym-website/gallery', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });
    const images = await Gallery.find({ businessId }).sort({ createdAt: -1 });
    return res.json(images);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/gym-website/gallery
router.post('/gym-website/gallery', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });

    const { imageUrl, caption } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

    const image = await Gallery.create({ businessId, imageUrl, caption });
    return res.status(201).json(image);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/gym-website/gallery/:id
router.delete('/gym-website/gallery/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const image = await Gallery.findOneAndDelete({ _id: req.params.id, businessId });
    if (!image) return res.status(404).json({ message: 'Image not found' });
    return res.json({ message: 'Image deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ------ REVIEWS (public submit, protected manage) ------

// POST /api/public/gym/:slug/reviews  — public submit
router.post('/public/gym/:slug/reviews', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const business = await Business.findOne({ slug, status: 'active' });
    if (!business) return res.status(404).json({ message: 'Gym not found' });

    const { customerName, rating, comment } = req.body;
    if (!customerName || !rating) {
      return res.status(400).json({ message: 'customerName and rating are required' });
    }

    const review = await Review.create({
      businessId: business._id,
      customerName,
      rating: Number(rating),
      comment
    });
    return res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/gym-website/reviews — protected
router.get('/gym-website/reviews', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    if (!businessId) return res.status(400).json({ message: 'businessId required' });
    const reviews = await Review.find({ businessId }).sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/gym-website/reviews/:id — protected
router.delete('/gym-website/reviews/:id', protectGymWebsite, async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const review = await Review.findOneAndDelete({ _id: req.params.id, businessId });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    return res.json({ message: 'Review deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
