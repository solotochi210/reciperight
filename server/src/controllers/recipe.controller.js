const recipeService = require('../services/recipe.service');
const ApiResponse = require('../utils/ApiResponse');

async function create(req, res) {
  const recipe = await recipeService.createRecipe(req.user.id, req.body);
  return ApiResponse.send(res, { statusCode: 201, data: { recipe }, message: 'Recipe created' });
}

async function list(req, res) {
  const { recipes, total, page, pages } = await recipeService.getRecipes(req.query);
  return ApiResponse.send(res, {
    data: recipes,
    message: 'OK',
    meta: { total, page, pages },
  });
}

async function getOne(req, res) {
  const recipe = await recipeService.getRecipeById(req.params.id, req.user?.id);
  return ApiResponse.send(res, { data: { recipe }, message: 'OK' });
}

async function update(req, res) {
  const recipe = await recipeService.updateRecipe(req.params.id, req.user.id, req.body);
  return ApiResponse.send(res, { data: { recipe }, message: 'Recipe updated' });
}

async function remove(req, res) {
  const result = await recipeService.deleteRecipe(req.params.id, req.user.id);
  return ApiResponse.send(res, { data: result, message: 'Recipe deleted' });
}

async function byUser(req, res) {
  const { recipes, total, page, pages } = await recipeService.getRecipesByUser(
    req.params.userId,
    req.query.page,
    req.query.limit
  );
  return ApiResponse.send(res, { data: recipes, message: 'OK', meta: { total, page, pages } });
}

async function related(req, res) {
  const recipes = await recipeService.getRelatedRecipes(req.params.id, Number(req.query.limit) || 6);
  return ApiResponse.send(res, { data: recipes, message: 'OK' });
}

module.exports = { create, list, getOne, update, remove, byUser, related };
