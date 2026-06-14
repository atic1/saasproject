const Subscription = require('../models/subscription');
const { getPlanDefinition } = require('../config/planDefinitions');

const ACTIVE_STATUSES = ['trial', 'active'];

const resolveBusinessSubscription = async (business) => {
  const embedded = business?.subscription || {};
  const persisted = business?._id
    ? await Subscription.findOne({ businessId: business._id })
    : null;

  const plan = persisted?.plan || embedded.plan || 'free_trial';
  const status = persisted?.status || embedded.status || 'trial';
  const currentPeriodEnd = persisted?.currentPeriodEnd || embedded.currentPeriodEnd || embedded.trialEnds;
  const definition = getPlanDefinition(plan);

  return {
    plan,
    status,
    currentPeriodEnd,
    limits: {
      ...definition.limits,
      ...(persisted?.limits?.toObject ? persisted.limits.toObject() : persisted?.limits || {})
    },
    features: definition.features
  };
};

const requireActiveSubscription = async (req, res, next) => {
  try {
    if (req.user?.platformrole === 'super_admin') {
      return next();
    }

    if (!req.activeBusiness) {
      return res.status(400).json({ message: 'Tenant context missing' });
    }

    const subscription = await resolveBusinessSubscription(req.activeBusiness);
    const expired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();

    req.subscription = subscription;
    req.planLimits = subscription.limits;

    if (!ACTIVE_STATUSES.includes(subscription.status) || expired) {
      return res.status(402).json({
        message: 'Active subscription required',
        subscription: {
          plan: subscription.plan,
          status: expired ? 'expired' : subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd || null
        }
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Subscription validation failed' });
  }
};

module.exports = {
  requireActiveSubscription,
  resolveBusinessSubscription
};
