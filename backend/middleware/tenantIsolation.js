const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BusinessMember = require('../models/businessMember');

/**
 * Middleware to enforce that each request includes a valid business context.
 * It extracts the business identifier from either the `X-Business-Id` header
 * or the JWT payload (if the token already contains `activeBusinessId`).
 * The middleware validates that the authenticated user has a BusinessMember
 * entry for the requested business and attaches the resolved business and role
 * to the request object for downstream handlers.
 */
const enforceTenant = async (req, res, next) => {
  try {
    // 1. Retrieve JWT token (same logic as existing protect middleware)
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 2. Determine requested businessId
    // Prefer explicit header, fallback to query/body, then JWT payload
    const headerBusinessId = req.headers['x-business-id'];
    const bodyBusinessId = req.body && req.body.businessId;
    const queryBusinessId = req.query && req.query.businessId;
    const tokenBusinessId = decoded.activeBusinessId; // optional, if stored in token

    const businessId = headerBusinessId || bodyBusinessId || queryBusinessId || tokenBusinessId;
    if (!businessId) {
      return res.status(400).json({ message: 'businessId required (X-Business-Id header or request field)' });
    }

    // 3. Verify membership for this user & business
    const membership = await BusinessMember.findOne({ userId: user._id, businessId })
      .populate('businessId');
    if (!membership) {
      return res.status(403).json({ message: 'User does not have access to this business' });
    }

    // 4. Attach useful data to request for downstream handlers
    req.user = user; // global identity
    req.activeBusiness = membership.businessId; // full Business doc
    req.activeBusinessId = membership.businessId._id.toString();
    req.role = membership.role; // role scoped to this business
    req.membership = membership;

    next();
  } catch (err) {
    console.error('Tenant enforcement error:', err);
    return res.status(401).json({ message: 'Not authorized, token failed or tenant validation error' });
  }
};

module.exports = { enforceTenant };
