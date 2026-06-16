export const ROUTES = {
  // Public
  HOME: '/',
  FEATURES: '/features',
  PRICING: '/pricing',
  CONTACT: '/contact',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Business portal (public)
  PORTAL: '/:slug',
  PORTAL_BOOK: '/book/:businessId',

  // Dashboard
  DASHBOARD: '/app',
  DASHBOARD_HOME: '/app/home',
  MEMBERS: '/app/members',
  BOOKINGS: '/app/bookings',
  STAFF: '/app/staff',
  SERVICES: '/app/services',
  PLANS: '/app/plans',
  INVOICES: '/app/invoices',
  SETTINGS: '/app/settings',
  WEBSITE_MANAGER: '/app/website',

  // Customer portal (authenticated)
  CUSTOMER_PORTAL: '/portal',
  MY_BOOKINGS: '/portal/bookings',
  MY_INVOICES: '/portal/invoices',

  // Super Admin
  SUPER_ADMIN: '/superadmin',
  SUPER_ADMIN_TENANTS: '/superadmin/tenants',
  SUPER_ADMIN_TICKETS: '/superadmin/tickets',
  SUPER_ADMIN_SETTINGS: '/superadmin/settings',
};