const express = require('express');
const ratingController = require('../controllers/rating.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { runValidation, ratingRules } = require('../middleware/validate.middleware');

const router = express.Router();

router.post('/recipe/:recipeId', authMiddleware, ratingRules, runValidation, ratingController.rate);
router.get('/recipe/:recipeId/me', authMiddleware, ratingController.myRating);

module.exports = router;
