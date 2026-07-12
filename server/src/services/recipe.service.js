const mongoose = require('mongoose');
const { Recipe, Saved } = require('../models');
const ApiError = require('../utils/ApiError');

const AUTHOR_FIELDS = 'name avatar';
const SORT_MAP = {
  createdAt: { createdAt: -1 },
  averageRating: { averageRating: -1, ratingCount: -1 },
  saveCount: { saveCount: -1 },
  prepTime: { prepTime: 1 },
};

function buildFilter({ tags, cuisine, difficulty, maxTime, author, publishedOnly = true }) {
  const filter = {};
  if (publishedOnly) filter.isPublished = true;
  if (author) filter.author = author;
  if (cuisine) filter.cuisine = cuisine;
  if (difficulty) filter.difficulty = difficulty;

  if (tags) {
    const tagList = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim());
    if (tagList.length) filter.tags = { $in: tagList };
  }

  if (maxTime) {
    const max = Number(maxTime);
    if (!Number.isNaN(max)) {
      // prepTime + cookTime <= maxTime
      filter.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, max] };
    }
  }
  return filter;
}

async function createRecipe(authorId, data) {
  const recipe = await Recipe.create({ ...data, author: authorId });
  return recipe.populate('author', AUTHOR_FIELDS);
}

async function getRecipes(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const filter = buildFilter(query);
  const sort = SORT_MAP[query.sort] || SORT_MAP.createdAt;

  const [recipes, total] = await Promise.all([
    Recipe.find(filter).populate('author', AUTHOR_FIELDS).sort(sort).skip(skip).limit(limit).lean(),
    Recipe.countDocuments(filter),
  ]);

  return { recipes, total, page, pages: Math.ceil(total / limit) || 1 };
}

async function getRecipeById(id, userId) {
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid recipe id');
  const recipe = await Recipe.findById(id).populate('author', AUTHOR_FIELDS).lean();
  if (!recipe) throw ApiError.notFound('Recipe not found');

  if (userId) {
    const saved = await Saved.exists({ user: userId, recipe: id });
    recipe.isSaved = !!saved;
  }
  return recipe;
}

async function updateRecipe(id, authorId, data) {
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid recipe id');
  const recipe = await Recipe.findById(id);
  if (!recipe) throw ApiError.notFound('Recipe not found');
  if (String(recipe.author) !== String(authorId)) {
    throw ApiError.forbidden('You can only edit your own recipes');
  }

  // Whitelist updatable fields.
  const fields = [
    'title', 'description', 'coverImage', 'images', 'ingredients', 'steps',
    'tags', 'cuisine', 'difficulty', 'prepTime', 'cookTime', 'servings', 'isPublished',
  ];
  fields.forEach((f) => {
    if (data[f] !== undefined) recipe[f] = data[f];
  });

  await recipe.save();
  return recipe.populate('author', AUTHOR_FIELDS);
}

async function deleteRecipe(id, authorId) {
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid recipe id');
  const recipe = await Recipe.findById(id);
  // Idempotent delete: if it's already gone, the desired end-state is satisfied.
  // Return success so repeated/duplicate deletes don't surface a false error.
  if (!recipe) return { id, alreadyDeleted: true };
  if (String(recipe.author) !== String(authorId)) {
    throw ApiError.forbidden('You can only delete your own recipes');
  }
  await recipe.deleteOne(); // triggers cascade pre-remove hook
  return { id };
}

async function getRecipesByUser(userId, page = 1, limit = 12) {
  if (!mongoose.isValidObjectId(userId)) throw ApiError.badRequest('Invalid user id');
  return getRecipes({ author: userId, page, limit });
}

async function getRelatedRecipes(recipeId, limit = 6) {
  if (!mongoose.isValidObjectId(recipeId)) throw ApiError.badRequest('Invalid recipe id');
  const recipe = await Recipe.findById(recipeId).select('tags').lean();
  if (!recipe) throw ApiError.notFound('Recipe not found');

  return Recipe.find({
    _id: { $ne: recipeId },
    isPublished: true,
    tags: { $in: recipe.tags || [] },
  })
    .populate('author', AUTHOR_FIELDS)
    .sort({ averageRating: -1, ratingCount: -1 })
    .limit(limit)
    .lean();
}

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getRecipesByUser,
  getRelatedRecipes,
};
