const tenantQuery = (req, extra = {}) => {
  if (!req.activeBusinessId) {
    throw new Error('Tenant context missing');
  }

  return {
    ...extra,
    businessId: req.activeBusinessId
  };
};

module.exports = tenantQuery;