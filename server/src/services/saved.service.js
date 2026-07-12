const mongoose = require('mongoose');
const { Saved, Recipe } = require('../models');
const ApiError = require('../utils/ApiError');

const AUTHOR_FIELDS = 'name avatar';

async function toggleSave(recipeId, userId) {
  if (!mongoose.isValidObjectId(recipeId)) throw ApiError.badRequest('Invalid recipe id');
  const recipe = await Recipe.exists({ _id: recipeId });
  if (!recipe) throw ApiError.notFound('Recipe not found');

  const existing = await Saved.findOne({ user: userId, recipe: recipeId });
  if (existing) {
    await existing.deleteOne(); // post-remove hook decrements saveCount
    return { saved: false };
  }
  await Saved.create({ user: userId, recipe: recipeId }); // post-save hook increments saveCount
  return { saved: true };
}

async function getSavedRecipes(userId, page = 1, limit = 12) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (p - 1) * l;

  const filter = { user: userId };
  const [saved, total] = await Promise.all([
    Saved.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate({ path: 'recipe', populate: { path: 'author', select: AUTHOR_FIELDS } })
      .lean(),
    Saved.countDocuments(filter),
  ]);

  // Unwrap to recipe docs, dropping any saves whose recipe was deleted.
  const recipes = saved.map((s) => s.recipe).filter(Boolean);
  return { recipes, total, page: p, pages: Math.ceil(total / l) || 1 };
}

async function isSaved(recipeId, userId) {
  if (!mongoose.isValidObjectId(recipeId)) return false;
  const exists = await Saved.exists({ user: userId, recipe: recipeId });
  return !!exists;
}

module.exports = { toggleSave, getSavedRecipes, isSaved };
