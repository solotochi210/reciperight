const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.put('/me', authMiddleware, userController.updateMe);
router.get('/:userId', userController.getProfile);
router.post('/:userId/follow', authMiddleware, userController.follow);

module.exports = router;
