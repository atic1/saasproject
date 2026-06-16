import { client } from './client';

export const customersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/customers?${query}`);
  },

  getById: (id) =>
    client.get(`/customers/${id}`),

  create: (data) =>
    client.post('/customers', data),

  update: (id, data) =>
    client.put(`/customers/${id}`, data),

  delete: (id) =>
    client.delete(`/customers/${id}`),

  getBookingHistory: (id) =>
    client.get(`/customers/${id}/bookings`),

  getInvoices: (id) =>
    client.get(`/customers/${id}/invoices`),
};