import { client } from './client';

export const businessApi = {
  getMyBusinesses: () =>
    client.get('/business/my-businesses'),

  getById: (id) =>
    client.get(`/business/${id}`),

  update: (id, data) =>
    client.put(`/business/${id}`, data),

  getPublicBySlug: (slug) =>
    client.get(`/portal/${slug}`),

  updateBranding: (id, data) =>
    client.put(`/business/${id}/branding`, data),

  updateHours: (id, data) =>
    client.put(`/business/${id}/hours`, data),
};