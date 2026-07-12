const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter(req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPEG, PNG and WebP images are allowed'));
    }
    return cb(null, true);
  },
});

// Wrap single-file upload to translate Multer errors into ApiError.
function singleImage(field = 'image') {
  return (req, res, next) => {
    upload.single(field)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('Image must be 5MB or smaller'));
        }
        return next(err);
      }
      if (!req.file) return next(ApiError.badRequest('No image file provided'));
      return next();
    });
  };
}

module.exports = { upload, singleImage, ALLOWED, MAX_SIZE };
