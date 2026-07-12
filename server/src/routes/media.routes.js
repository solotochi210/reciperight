const express = require('express');
const mediaController = require('../controllers/media.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { singleImage } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authMiddleware); // all media routes require auth

router.post('/upload', singleImage('image'), mediaController.upload);
// publicId can include the folder path (e.g. reciperight/cover/abc) → wildcard.
router.delete('/:publicId(*)', mediaController.remove);

module.exports = router;
