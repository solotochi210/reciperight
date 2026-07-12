const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/** Collects express-validator results and throws a 400 ApiError if any failed. */
function runValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    throw ApiError.badRequest('Validation failed', errors);
  }
  return next();
}

// --- Auth -----------------------------------------------------------------
const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// --- Recipe ---------------------------------------------------------------
const recipeRules = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('ingredients.*.name').trim().notEmpty().withMessage('Ingredient name is required'),
  body('steps').isArray({ min: 1 }).withMessage('At least one step is required'),
  body('steps.*.instruction').trim().notEmpty().withMessage('Step instruction is required'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium or Hard'),
  body('prepTime').optional().isInt({ min: 0 }).withMessage('Prep time must be a positive integer'),
  body('cookTime').optional().isInt({ min: 0 }).withMessage('Cook time must be a positive integer'),
  body('servings').optional().isInt({ min: 1 }).withMessage('Servings must be at least 1'),
];

// --- Comment / Rating -----------------------------------------------------
const commentRules = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment cannot be empty'),
];

const ratingRules = [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
];

module.exports = {
  runValidation,
  registerRules,
  loginRules,
  recipeRules,
  commentRules,
  ratingRules,
};
