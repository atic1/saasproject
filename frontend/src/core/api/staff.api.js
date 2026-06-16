import { client } from './client';

export const staffApi = {
  getAll: () =>
    client.get('/staff'),

  getById: (id) =>
    client.get(`/staff/${id}`),

  create: (data) =>
    client.post('/staff', data),

  update: (id, data) =>
    client.put(`/staff/${id}`, data),

  deactivate: (id) =>
    client.patch(`/staff/${id}/deactivate`),

  getSchedule: (id) =>
    client.get(`/staff/${id}/schedule`),

  updateSchedule: (id, data) =>
    client.put(`/staff/${id}/schedule`, data),
};