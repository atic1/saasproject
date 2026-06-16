const ROLE_PERMISSIONS = {
  owner: ['*'],
  manager: [
    'booking.read',
    'booking.create',
    'booking.update',
    'booking.delete',
    'customer.read',
    'customer.create',
    'customer.update',
    'customer.delete',
    'plan.read',
    'plan.create',
    'plan.update',
    'offer.read',
    'offer.create',
    'offer.update',
    'notification.read',
    'notification.create',
    'notification.update',
    'analytics.read',
    'business.read',
    'business.update',
    'billing.read'
  ],
  receptionist: [
    'booking.read',
    'booking.create',
    'booking.update',
    'customer.read',
    'customer.create',
    'customer.update',
    'notification.read',
    'notification.create'
  ],
  staff: ['booking.read', 'booking.create', 'booking.update', 'customer.read', 'customer.update'],
  trainer: ['booking.read', 'booking.create', 'booking.update', 'customer.read', 'customer.update'],
  doctor: ['booking.read', 'booking.create', 'booking.update', 'customer.read', 'customer.update'],
  stylist: ['booking.read', 'booking.create', 'booking.update', 'customer.read', 'customer.update'],
  customer: ['booking.read']
};

const hasPermission = (req, permission) => {
  if (req.user?.platformrole === 'super_admin') {
    return true;
  }

  const rolePermissions = ROLE_PERMISSIONS[req.role] || [];
  if (rolePermissions.includes('*') || rolePermissions.includes(permission)) {
    return true;
  }

  const [resource, action] = permission.split('.');
  return (req.membership?.permissions || []).some(entry => {
    const actions = entry.actions || [];
    return entry.resource === resource && (actions.includes('*') || actions.includes(action));
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (req.user?.platformrole === 'super_admin' || roles.includes(req.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient role' });
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (hasPermission(req, permission)) {
      return next();
    }

    return res.status(403).json({ message: `Missing permission: ${permission}` });
  };
};

module.exports = {
  ROLE_PERMISSIONS,
  hasPermission,
  requireRole,
  requirePermission
};
