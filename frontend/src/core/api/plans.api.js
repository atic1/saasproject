import { client } from './client';

export const plansApi = {
  getAll: () =>
    client.get('/plans'),

  getById: (id) =>
    client.get(`/plans/${id}`),

  create: (data) =>
    client.post('/plans', data),

  update: (id, data) =>
    client.put(`/plans/${id}`, data),

  delete: (id) =>
    client.delete(`/plans/${id}`),
};