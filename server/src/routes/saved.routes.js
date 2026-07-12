const express = require('express');
const savedController = require('../controllers/saved.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware); // all saved routes require auth

router.get('/', savedController.list);
router.post('/:recipeId', savedController.toggle);
router.get('/:recipeId/status', savedController.status);

module.exports = router;
