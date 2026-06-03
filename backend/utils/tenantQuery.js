const tenantQuery = (req, extra = {}) => ({
  ...extra,
  businessId: req.activeBusinessId
});

module.exports = tenantQuery;