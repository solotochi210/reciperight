const express = require('express');
const recipeController = require('../controllers/recipe.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');
const { runValidation, recipeRules } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', recipeController.list);
router.post('/', authMiddleware, recipeRules, runValidation, recipeController.create);
router.get('/user/:userId', recipeController.byUser);
router.get('/:id/related', recipeController.related);
router.get('/:id', optionalAuth, recipeController.getOne);
router.put('/:id', authMiddleware, recipeRules, runValidation, recipeController.update);
router.delete('/:id', authMiddleware, recipeController.remove);

module.exports = router;
