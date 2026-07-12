import api from './axios';

export const recipeApi = {
  getRecipes: (params = {}) => api.get('/recipes', { params }).then((r) => r.data),
  searchRecipes: (params = {}) => api.get('/search', { params }).then((r) => r.data),
  getRecipeById: (id) => api.get(`/recipes/${id}`).then((r) => r.data),
  getRelatedRecipes: (id, limit = 6) =>
    api.get(`/recipes/${id}/related`, { params: { limit } }).then((r) => r.data),
  getRecipesByUser: (userId, params = {}) =>
    api.get(`/recipes/user/${userId}`, { params }).then((r) => r.data),
  createRecipe: (payload) => api.post('/recipes', payload).then((r) => r.data),
  updateRecipe: (id, payload) => api.put(`/recipes/${id}`, payload).then((r) => r.data),
  deleteRecipe: (id) => api.delete(`/recipes/${id}`).then((r) => r.data),
};

export default recipeApi;
