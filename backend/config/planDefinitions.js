const PLAN_DEFINITIONS = {
  free: {
    name: 'Free',
    limits: {
      users: 1,
      customers: 100,
      bookingsPerMonth: 100,
      notificationsPerMonth: 50
    },
    features: {
      booking: true,
      customerPortal: false,
      analytics: false,
      customDomain: false
    }
  },
  free_trial: {
    name: 'Free Trial',
    limits: {
      users: 3,
      customers: 250,
      bookingsPerMonth: 250,
      notificationsPerMonth: 100
    },
    features: {
      booking: true,
      customerPortal: true,
      analytics: false,
      customDomain: false
    }
  },
  starter: {
    name: 'Starter',
    limits: {
      users: 5,
      customers: 500,
      bookingsPerMonth: 1000,
      notificationsPerMonth: 500
    },
    features: {
      booking: true,
      customerPortal: true,
      analytics: false,
      customDomain: false
    }
  },
  growth: {
    name: 'Growth',
    limits: {
      users: 15,
      customers: 2500,
      bookingsPerMonth: 5000,
      notificationsPerMonth: 2500
    },
    features: {
      booking: true,
      customerPortal: true,
      analytics: true,
      customDomain: false
    }
  },
  pro: {
    name: 'Pro',
    limits: {
      users: 50,
      customers: 10000,
      bookingsPerMonth: 25000,
      notificationsPerMonth: 10000
    },
    features: {
      booking: true,
      customerPortal: true,
      analytics: true,
      customDomain: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    limits: {
      users: null,
      customers: null,
      bookingsPerMonth: null,
      notificationsPerMonth: null
    },
    features: {
      booking: true,
      customerPortal: true,
      analytics: true,
      customDomain: true
    }
  }
};

const getPlanDefinition = (plan) => {
  return PLAN_DEFINITIONS[plan] || PLAN_DEFINITIONS.free;
};

module.exports = {
  PLAN_DEFINITIONS,
  getPlanDefinition
};
