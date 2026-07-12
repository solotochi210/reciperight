const savedService = require('../services/saved.service');
const ApiResponse = require('../utils/ApiResponse');

async function toggle(req, res) {
  const result = await savedService.toggleSave(req.params.recipeId, req.user.id);
  return ApiResponse.send(res, { data: result, message: result.saved ? 'Saved' : 'Removed' });
}

async function list(req, res) {
  const { recipes, total, page, pages } = await savedService.getSavedRecipes(
    req.user.id,
    req.query.page,
    req.query.limit
  );
  return ApiResponse.send(res, { data: recipes, message: 'OK', meta: { total, page, pages } });
}

async function status(req, res) {
  const saved = await savedService.isSaved(req.params.recipeId, req.user.id);
  return ApiResponse.send(res, { data: { saved }, message: 'OK' });
}

module.exports = { toggle, list, status };
