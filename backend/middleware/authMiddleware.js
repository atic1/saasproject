const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BusinessMember = require('../models/businessMember');

const DEMO_ADMIN_IDS = ['admin', 'salonadmin', 'clinicadmin', 'superadmin'];

/**
 * protect middleware — verifies JWT and attaches req.user and req.memberships.
 * Works for both real users (MongoDB ObjectId tokens) and demo shortcut accounts.
 */
const protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Handle demo admin shortcut tokens
      if (DEMO_ADMIN_IDS.includes(decoded.id)) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.id === 'superadmin' ? 'Super Admin' : 'Demo Admin',
          platformrole: decoded.platformrole || (decoded.id === 'superadmin' ? 'super_admin' : 'user')
        };
        req.memberships = [];
        return next();
      }

      // Real user lookup
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const memberships = await BusinessMember.find({ userId: user._id }).populate('businessId');

      req.user = user;
      req.memberships = memberships;

      next();
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

/**
 * requireBusinessRole — ensures user has one of the specified roles for the active business.
 */
const requireBusinessRole = (roles) => {
  return async (req, res, next) => {
    const businessId =
      req.activeBusinessId ||
      req.body?.businessId ||
      req.query?.businessId ||
      req.headers['x-business-id'];

    if (!businessId) {
      return res.status(400).json({ message: 'businessId required' });
    }

    // Super admins and demo admin accounts bypass role check
    if (
      req.user?.platformrole === 'super_admin' ||
      DEMO_ADMIN_IDS.includes(String(req.user?._id))
    ) {
      req.activeBusinessId = req.activeBusinessId || businessId;
      req.role = 'owner';
      return next();
    }

    // Find membership in the already-attached memberships array
    const membership = (req.memberships || []).find(m => {
      const b = m.businessId;
      if (!b) return false;
      const candidateId = b._id ? b._id.toString() : b.toString();
      return candidateId === businessId;
    });

    if (!membership) {
      return res.status(403).json({ message: 'No access to this business' });
    }

    if (roles && roles.length > 0 && !roles.includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient role' });
    }

    req.business = membership.businessId;
    req.activeBusiness = membership.businessId;
    req.activeBusinessId = membership.businessId._id
      ? membership.businessId._id.toString()
      : businessId;
    req.role = membership.role;
    req.membership = membership;

    next();
  };
};

module.exports = { protect, requireBusinessRole };
