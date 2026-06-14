const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BusinessMember = require('../models/businessMember');

const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 1. Get user (GLOBAL identity)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // 2. Get all memberships
      const memberships = await BusinessMember.find({
        userId: user._id
      }).populate('businessId');

      // 3. Attach to request
      req.user = user;
      req.memberships = memberships;

      next();
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };

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

    const membership = req.memberships.find(
      m => m.businessId._id.toString() === businessId
    );

    if (!membership) {
      return res.status(403).json({ message: 'No access to this business' });
    }

    if (!roles.includes(membership.role)) {
      return res.status(403).json({ message: 'Insufficient role' });
    }

    req.business = membership.businessId;
    req.activeBusiness = membership.businessId;
    req.activeBusinessId = membership.businessId._id.toString();
    req.role = membership.role;
    req.membership = membership;

    next();
  };
};

module.exports = { protect, requireBusinessRole };
