import api from './axios';

export const savedApi = {
  toggle: (recipeId) => api.post(`/saved/${recipeId}`).then((r) => r.data),
  list: (params = {}) => api.get('/saved', { params }).then((r) => r.data),
  status: (recipeId) => api.get(`/saved/${recipeId}/status`).then((r) => r.data),
};

export default savedApi;
