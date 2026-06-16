import { client } from './client';

export const bookingsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/bookings?${query}`);
  },

  getById: (id) =>
    client.get(`/bookings/${id}`),

  create: (data) =>
    client.post('/bookings', data),

  updateStatus: (id, status) =>
    client.patch(`/bookings/${id}/status`, { status }),

  cancel: (id) =>
    client.patch(`/bookings/${id}/status`, { status: 'cancelled' }),

  getAvailability: (businessId, date, serviceId) =>
    client.get(`/availability?businessId=${businessId}&date=${date}&serviceId=${serviceId}`),
};