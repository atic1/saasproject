const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Business = require('../models/business');
const BusinessMember = require('../models/businessMember');

const DEMO_ADMIN_IDS = ['admin', 'salonadmin', 'clinicadmin', 'superadmin'];

/**
 * Middleware to enforce business tenant context.
 * - For real users: looks up BusinessMember to verify access.
 * - For demo admin shortcut tokens: resolves business by type/slug.
 * - Attaches req.activeBusiness, req.activeBusinessId, req.role, req.membership.
 */
const enforceTenant = async (req, res, next) => {
  try {
    // 1. Get JWT token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    // 2. Resolve user — use req.user if protect middleware already ran, otherwise look up
    let user = req.user;
    if (!user) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (_) { /* id may not be a valid ObjectId for demo tokens */ }
    }

    // 3. Determine businessId from headers/body/query/token
    const headerBusinessId = req.headers['x-business-id'] || req.headers['x-business-slug'];
    const bodyBusinessId = req.body && req.body.businessId;
    const queryBusinessId = req.query && req.query.businessId;
    const tokenBusinessId = decoded.activeBusinessId;
    let businessId = headerBusinessId || bodyBusinessId || queryBusinessId || tokenBusinessId;

    // 4. Handle DEMO admin shortcut accounts (string IDs like 'admin', 'salonadmin')
    if (DEMO_ADMIN_IDS.includes(decoded.id) || DEMO_ADMIN_IDS.includes(String(user?._id))) {
      if (!user) {
        user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.id === 'superadmin' ? 'Super Admin' : 'Demo Admin',
          platformrole: decoded.platformrole || (decoded.id === 'superadmin' ? 'super_admin' : 'user')
        };
      }

      // Superadmin doesn't need a business context
      if (decoded.id === 'superadmin' || user?.platformrole === 'super_admin') {
        req.user = user;
        req.role = 'owner';
        req.activeBusinessId = businessId || null;
        return next();
      }

      // Resolve business for demo tenant admins
      let bizDoc = null;
      if (businessId) {
        bizDoc = /^[0-9a-fA-F]{24}$/.test(businessId)
          ? await Business.findById(businessId)
          : await Business.findOne({ slug: businessId });
      }

      if (!bizDoc) {
        const typeMap = { admin: 'gym', salonadmin: 'salon', clinicadmin: 'clinic' };
        const targetType = typeMap[decoded.id] || typeMap[String(user._id)];
        bizDoc = targetType
          ? await Business.findOne({ type: targetType })
          : await Business.findOne({});
      }

      if (!bizDoc) {
        return res.status(404).json({ message: 'No business found for demo account' });
      }

      req.user = user;
      req.activeBusiness = bizDoc;
      req.activeBusinessId = bizDoc._id.toString();
      req.role = 'owner';
      req.membership = { role: 'owner', businessId: bizDoc._id, permissions: [] };
      return next();
    }

    // 5. REAL USER flow — require user to exist in DB
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID required. Send X-Business-Id header.' });
    }

    // Resolve slug → ObjectId
    let resolvedBusinessId = businessId;
    if (!/^[0-9a-fA-F]{24}$/.test(businessId)) {
      const bizBySlug = await Business.findOne({ slug: businessId });
      if (!bizBySlug) {
        return res.status(404).json({ message: `Business not found for slug: ${businessId}` });
      }
      resolvedBusinessId = bizBySlug._id.toString();
    }

    // Look up real BusinessMember record (try req.memberships first for performance)
    let membership = null;
    if (Array.isArray(req.memberships) && req.memberships.length > 0) {
      membership = req.memberships.find(m => {
        const b = m.businessId;
        if (!b) return false;
        const candidateId = b._id ? b._id.toString() : b.toString();
        return candidateId === resolvedBusinessId;
      });
    }

    if (!membership) {
      membership = await BusinessMember.findOne({
        userId: user._id,
        businessId: resolvedBusinessId
      }).populate('businessId');
    }

    if (!membership) {
      return res.status(403).json({ message: 'You do not have access to this business' });
    }

    const bizDoc = membership.businessId?._id ? membership.businessId : await Business.findById(resolvedBusinessId);

    req.user = user;
    req.activeBusiness = bizDoc;
    req.activeBusinessId = resolvedBusinessId;
    req.role = membership.role;
    req.membership = membership;

    next();
  } catch (err) {
    console.error('Tenant enforcement error:', err.message);
    return res.status(401).json({ message: 'Not authorized: ' + err.message });
  }
};

module.exports = { enforceTenant };
