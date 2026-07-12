import api from './axios';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  refreshToken: () => api.post('/auth/refresh').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
};

export default authApi;
