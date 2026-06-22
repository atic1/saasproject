import { client } from './client';

export const invoicesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/invoices?${query}`);
  },

  getById: (id) =>
    client.get(`/invoices/${id}`),

  markAsPaid: (id) =>
    client.patch(`/invoices/${id}/mark-paid`),

  getByCustomer: (customerId) =>
    client.get(`/invoices?customerId=${customerId}`),
};