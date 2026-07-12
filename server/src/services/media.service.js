const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const FOLDER = 'reciperight';

// Named transformation presets per asset kind.
const TRANSFORMS = {
  cover: [{ width: 800, height: 600, crop: 'fill', gravity: 'auto' }, { fetch_format: 'auto', quality: 'auto' }],
  step: [{ width: 600, height: 400, crop: 'fill', gravity: 'auto' }, { fetch_format: 'auto', quality: 'auto' }],
  avatar: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }, { fetch_format: 'auto', quality: 'auto' }],
};

/**
 * Upload an image buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {string} kind  one of cover|step|avatar (defaults to cover)
 */
function uploadImage(buffer, mimetype, kind = 'cover') {
  if (!cloudinary.isConfigured) {
    throw ApiError.internal('Media service is not configured');
  }
  const transformation = TRANSFORMS[kind] || TRANSFORMS.cover;
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;

  return cloudinary.uploader.upload(dataUri, {
    folder: `${FOLDER}/${kind}`,
    transformation,
    resource_type: 'image',
  });
}

async function deleteImage(publicId) {
  if (!publicId) throw ApiError.badRequest('publicId is required');
  if (!cloudinary.isConfigured) {
    throw ApiError.internal('Media service is not configured');
  }
  return cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadImage, deleteImage, TRANSFORMS, FOLDER };
