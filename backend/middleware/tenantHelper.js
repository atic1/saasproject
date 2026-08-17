/**
 * checkTenantMatch - verifies the :businessId route param matches the
 * active tenant context set by enforceTenant middleware.
 * Accepts ObjectId match OR slug match.
 */
const checkTenantMatch = (req) => {
  const paramId = req.params.businessId;
  if (!paramId) return true; // no param = no check needed
  const activeId = req.activeBusinessId;
  const activeSlug = req.activeBusiness?.slug;
  // Match by ObjectId or by slug
  return paramId === activeId || paramId === activeSlug;
};

module.exports = { checkTenantMatch };
