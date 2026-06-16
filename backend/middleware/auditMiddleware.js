const AuditLog = require('../models/auditlogs');

const ACTION_BY_METHOD = {
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
};

const RESOURCE_BY_BASE = {
  businesses: 'business',
  customers: 'customer',
  plans: 'plan',
  payments: 'payment',
  bookings: 'booking',
  notifications: 'notification',
  offers: 'offer',
  billing: 'billing',
  dashboard: 'report'
};

const auditTenantRequest = (req, res, next) => {
  const action = ACTION_BY_METHOD[req.method];

  if (!action) {
    return next();
  }

  res.on('finish', () => {
    if (!req.activeBusinessId || res.statusCode >= 400) {
      return;
    }

    const baseResource = req.baseUrl.split('/').filter(Boolean).pop();
    const resource = RESOURCE_BY_BASE[baseResource] || 'business';

    AuditLog.create({
      businessId: req.activeBusinessId,
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.role,
      action,
      resource,
      resourceId: req.params?.id,
      description: `${req.method} ${req.originalUrl}`,
      newValues: req.method === 'DELETE' ? undefined : req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(error => {
      console.error('Audit log write failed:', error.message);
    });
  });

  next();
};

module.exports = {
  auditTenantRequest
};
