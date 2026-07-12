const express = require('express');
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { runValidation, commentRules } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/recipe/:recipeId', commentController.listForRecipe);
router.get('/:commentId/replies', commentController.listReplies);
router.post('/recipe/:recipeId', authMiddleware, commentRules, runValidation, commentController.create);
router.post('/:commentId/reply', authMiddleware, commentRules, runValidation, commentController.reply);
router.put('/:commentId', authMiddleware, commentRules, runValidation, commentController.update);
router.delete('/:commentId', authMiddleware, commentController.remove);
router.post('/:commentId/like', authMiddleware, commentController.like);

module.exports = router;
