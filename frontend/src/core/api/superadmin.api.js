import { client } from './client';

export const superAdminApi = {
  // Platform stats
  getStats: () =>
    client.get('/superadmin/stats'),

  // Tenants
  getAllTenants: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/superadmin/businesses?${query}`);
  },

  getTenantById: (id) =>
    client.get(`/superadmin/businesses/${id}`),

  approveTenant: (id) =>
    client.patch(`/superadmin/businesses/${id}/approve`),

  suspendTenant: (id) =>
    client.patch(`/superadmin/businesses/${id}/suspend`),

  rejectTenant: (id) =>
    client.patch(`/superadmin/businesses/${id}/reject`),

  deleteTenant: (id) =>
    client.delete(`/superadmin/businesses/${id}`),

  // Support tickets
  getTickets: () =>
    client.get('/superadmin/tickets'),

  replyToTicket: (id, message) =>
    client.post(`/superadmin/tickets/${id}/reply`, { message }),

  resolveTicket: (id) =>
    client.patch(`/superadmin/tickets/${id}/resolve`),
};