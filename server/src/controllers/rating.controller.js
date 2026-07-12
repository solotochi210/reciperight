const ratingService = require('../services/rating.service');
const ApiResponse = require('../utils/ApiResponse');

async function rate(req, res) {
  const result = await ratingService.rateRecipe(req.params.recipeId, req.user.id, req.body.score);
  return ApiResponse.send(res, { data: result, message: 'Rating saved' });
}

async function myRating(req, res) {
  const score = await ratingService.getUserRating(req.params.recipeId, req.user.id);
  return ApiResponse.send(res, { data: { score }, message: 'OK' });
}

module.exports = { rate, myRating };
