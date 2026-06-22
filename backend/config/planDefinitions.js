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
      customDomain: false,
      // 19 gym features (disabled on free)
      memberProfiles: false,
      membershipTiers: false,
      attendanceTracking: false,
      equipmentTracker: false,
      classScheduler: false,
      personalTrainerBooking: false,
      waitlistManagement: false,
      qrCheckIn: false,
      autoRenewalBilling: false,
      promoDiscounts: false,
      onlinePayments: false,
      invoiceHistory: false,
      workoutPlans: false,
      bodyMetrics: false,
      loyaltyRewards: false,
      smsEmailAlerts: false,
      gymStore: false,
      nutritionPlans: false,
      reportsExport: false
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
      customDomain: false,
      // 19 gym features (free_trial defaults)
      memberProfiles: true,
      membershipTiers: true,
      attendanceTracking: true,
      equipmentTracker: false,
      classScheduler: true,
      personalTrainerBooking: false,
      waitlistManagement: false,
      qrCheckIn: true,
      autoRenewalBilling: true,
      promoDiscounts: false,
      onlinePayments: false,
      invoiceHistory: true,
      workoutPlans: false,
      bodyMetrics: false,
      loyaltyRewards: false,
      smsEmailAlerts: true,
      gymStore: false,
      nutritionPlans: false,
      reportsExport: false
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
      customDomain: false,
      // 19 gym features (starter defaults)
      memberProfiles: true,
      membershipTiers: true,
      attendanceTracking: true,
      equipmentTracker: false,
      classScheduler: true,
      personalTrainerBooking: true,
      waitlistManagement: false,
      qrCheckIn: true,
      autoRenewalBilling: true,
      promoDiscounts: true,
      onlinePayments: false,
      invoiceHistory: true,
      workoutPlans: true,
      bodyMetrics: false,
      loyaltyRewards: false,
      smsEmailAlerts: true,
      gymStore: false,
      nutritionPlans: false,
      reportsExport: false
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
      customDomain: false,
      // 19 gym features (growth defaults)
      memberProfiles: true,
      membershipTiers: true,
      attendanceTracking: true,
      equipmentTracker: true,
      classScheduler: true,
      personalTrainerBooking: true,
      waitlistManagement: true,
      qrCheckIn: true,
      autoRenewalBilling: true,
      promoDiscounts: true,
      onlinePayments: false,
      invoiceHistory: true,
      workoutPlans: true,
      bodyMetrics: true,
      loyaltyRewards: false,
      smsEmailAlerts: true,
      gymStore: false,
      nutritionPlans: false,
      reportsExport: true
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
      customDomain: true,
      // 19 gym features (pro defaults)
      memberProfiles: true,
      membershipTiers: true,
      attendanceTracking: true,
      equipmentTracker: true,
      classScheduler: true,
      personalTrainerBooking: true,
      waitlistManagement: true,
      qrCheckIn: true,
      autoRenewalBilling: true,
      promoDiscounts: true,
      onlinePayments: true,
      invoiceHistory: true,
      workoutPlans: true,
      bodyMetrics: true,
      loyaltyRewards: true,
      smsEmailAlerts: true,
      gymStore: true,
      nutritionPlans: true,
      reportsExport: true
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
      customDomain: true,
      // 19 gym features (enterprise defaults)
      memberProfiles: true,
      membershipTiers: true,
      attendanceTracking: true,
      equipmentTracker: true,
      classScheduler: true,
      personalTrainerBooking: true,
      waitlistManagement: true,
      qrCheckIn: true,
      autoRenewalBilling: true,
      promoDiscounts: true,
      onlinePayments: true,
      invoiceHistory: true,
      workoutPlans: true,
      bodyMetrics: true,
      loyaltyRewards: true,
      smsEmailAlerts: true,
      gymStore: true,
      nutritionPlans: true,
      reportsExport: true
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
