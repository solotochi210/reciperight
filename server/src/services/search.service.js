const { Recipe } = require('../models');

const AUTHOR_FIELDS = 'name avatar';
const SORT_MAP = {
  createdAt: { createdAt: -1 },
  averageRating: { averageRating: -1, ratingCount: -1 },
  saveCount: { saveCount: -1 },
  prepTime: { prepTime: 1 },
};

async function search({ q, tags, cuisine, difficulty, maxTime, sort, page = 1, limit = 12 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (p - 1) * l;

  const filter = { isPublished: true };

  if (cuisine) filter.cuisine = cuisine;
  if (difficulty) filter.difficulty = difficulty;
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
    if (tagList.length) filter.tags = { $in: tagList };
  }
  if (maxTime) {
    const max = Number(maxTime);
    if (!Number.isNaN(max)) {
      filter.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, max] };
    }
  }

  const hasText = q && String(q).trim().length > 0;
  let projection;
  let sortSpec;

  if (hasText) {
    filter.$text = { $search: String(q).trim() };
    projection = { score: { $meta: 'textScore' } };
    sortSpec = SORT_MAP[sort] || { score: { $meta: 'textScore' } };
  } else {
    sortSpec = SORT_MAP[sort] || SORT_MAP.createdAt;
  }

  const queryBuilder = Recipe.find(filter, projection)
    .populate('author', AUTHOR_FIELDS)
    .sort(sortSpec)
    .skip(skip)
    .limit(l);

  const [recipes, total] = await Promise.all([
    queryBuilder.lean(),
    Recipe.countDocuments(filter),
  ]);

  return { recipes, total, page: p, pages: Math.ceil(total / l) || 1 };
}

module.exports = { search };
