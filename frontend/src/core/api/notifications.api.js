import { client } from './client';

export const notificationsApi = {
  getAll: () =>
    client.get('/notifications'),

  markAsRead: (id) =>
    client.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    client.patch('/notifications/read-all'),
};