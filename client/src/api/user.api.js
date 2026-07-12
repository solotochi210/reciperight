import api from './axios';

export const userApi = {
  getProfile: (userId) => api.get(`/users/${userId}`).then((r) => r.data),
  updateMe: (payload) => api.put('/users/me', payload).then((r) => r.data),
  follow: (userId) => api.post(`/users/${userId}/follow`).then((r) => r.data),
};

export default userApi;
