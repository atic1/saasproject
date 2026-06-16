const tenantModel = (Model, req) => {
  if (!req.activeBusinessId) {
    throw new Error('Tenant context missing');
  }

  return {
    find: (query = {}) =>
      Model.find({
        ...query,
        businessId: req.activeBusinessId
      }),

    findOne: (query = {}) =>
      Model.findOne({
        ...query,
        businessId: req.activeBusinessId
      }),

    create: (data) =>
      Model.create({
        ...data,
        businessId: req.activeBusinessId
      })
  };
};

module.exports = tenantModel;