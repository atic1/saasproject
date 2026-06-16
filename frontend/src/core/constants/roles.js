export const PLATFORM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  USER: 'user',
};

export const BUSINESS_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  RECEPTIONIST: 'receptionist',
  STAFF: 'staff',
  TRAINER: 'trainer',
  DOCTOR: 'doctor',
  STYLIST: 'stylist',
  CUSTOMER: 'customer',
};

// Who can do write operations in dashboard
export const WRITE_ROLES = [
  BUSINESS_ROLES.OWNER,
  BUSINESS_ROLES.MANAGER,
];

// Who can manage bookings
export const BOOKING_ROLES = [
  BUSINESS_ROLES.OWNER,
  BUSINESS_ROLES.MANAGER,
  BUSINESS_ROLES.RECEPTIONIST,
];