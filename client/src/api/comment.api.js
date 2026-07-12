import api from './axios';

export const commentApi = {
  getForRecipe: (recipeId, params = {}) =>
    api.get(`/comments/recipe/${recipeId}`, { params }).then((r) => r.data),
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies`).then((r) => r.data),
  create: (recipeId, content) =>
    api.post(`/comments/recipe/${recipeId}`, { content }).then((r) => r.data),
  reply: (commentId, recipeId, content) =>
    api.post(`/comments/${commentId}/reply`, { recipe: recipeId, content }).then((r) => r.data),
  update: (commentId, content) => api.put(`/comments/${commentId}`, { content }).then((r) => r.data),
  remove: (commentId) => api.delete(`/comments/${commentId}`).then((r) => r.data),
  like: (commentId) => api.post(`/comments/${commentId}/like`).then((r) => r.data),
};

export default commentApi;
