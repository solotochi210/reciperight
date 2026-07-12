import api from './axios';

export const ratingApi = {
  rate: (recipeId, score) => api.post(`/ratings/recipe/${recipeId}`, { score }).then((r) => r.data),
  myRating: (recipeId) => api.get(`/ratings/recipe/${recipeId}/me`).then((r) => r.data),
};

export default ratingApi;
