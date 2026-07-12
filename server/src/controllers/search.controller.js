const searchService = require('../services/search.service');
const ApiResponse = require('../utils/ApiResponse');

async function search(req, res) {
  const { q, tags, cuisine, difficulty, maxTime, sort, page, limit } = req.query;
  const { recipes, total, page: p, pages } = await searchService.search({
    q,
    tags,
    cuisine,
    difficulty,
    maxTime,
    sort,
    page,
    limit,
  });
  return ApiResponse.send(res, { data: recipes, message: 'OK', meta: { total, page: p, pages } });
}

module.exports = { search };
