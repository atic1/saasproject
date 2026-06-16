import { client } from './client';

export const authApi = {
  login: (credentials) =>
    client.post('/auth/login', credentials),

  register: (data) =>
    client.post('/auth/register', data),

  getMe: () =>
    client.get('/auth/me'),

  forgotPassword: (email) =>
    client.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    client.post('/auth/reset-password', { token, password }),

  selectBusiness: (businessId) =>
    client.post('/auth/select-business', { businessId }),
};