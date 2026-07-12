const mongoose = require('mongoose');
const { Rating, Recipe } = require('../models');
const ApiError = require('../utils/ApiError');

async function rateRecipe(recipeId, userId, score) {
  if (!mongoose.isValidObjectId(recipeId)) throw ApiError.badRequest('Invalid recipe id');
  const recipe = await Recipe.exists({ _id: recipeId });
  if (!recipe) throw ApiError.notFound('Recipe not found');

  // Upsert the user's rating; post-update hook recalculates the recipe aggregate.
  await Rating.findOneAndUpdate(
    { recipe: recipeId, user: userId },
    { $set: { score } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const updated = await Recipe.findById(recipeId).select('averageRating ratingCount').lean();
  return { score, averageRating: updated.averageRating, ratingCount: updated.ratingCount };
}

async function getUserRating(recipeId, userId) {
  if (!mongoose.isValidObjectId(recipeId)) throw ApiError.badRequest('Invalid recipe id');
  const rating = await Rating.findOne({ recipe: recipeId, user: userId }).select('score').lean();
  return rating ? rating.score : null;
}

module.exports = { rateRecipe, getUserRating };
