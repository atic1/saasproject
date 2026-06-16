// Centralized query keys prevent typos and cache mismatches
export const QUERY_KEYS = {
  // Auth
  ME: ['me'],

  // Business
  BUSINESSES: ['businesses'],
  BUSINESS: (id) => ['business', id],

  // Members/Customers
  MEMBERS: (filters) => ['members', filters],
  MEMBER: (id) => ['member', id],

  // Bookings
  BOOKINGS: (filters) => ['bookings', filters],
  BOOKING: (id) => ['booking', id],
  AVAILABILITY: (businessId, date) => ['availability', businessId, date],

  // Staff
  STAFF: ['staff'],

  // Services & Plans
  SERVICES: ['services'],
  PLANS: ['plans'],

  // Invoices
  INVOICES: (filters) => ['invoices', filters],

  // Super Admin
  TENANTS: (filters) => ['tenants', filters],
  TICKETS: ['tickets'],
};