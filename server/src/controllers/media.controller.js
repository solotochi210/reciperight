const mediaService = require('../services/media.service');
const ApiResponse = require('../utils/ApiResponse');

async function upload(req, res) {
  const kind = req.body.kind || req.query.kind || 'cover';
  const result = await mediaService.uploadImage(req.file.buffer, req.file.mimetype, kind);
  return ApiResponse.send(res, {
    statusCode: 201,
    data: { url: result.secure_url, publicId: result.public_id },
    message: 'Image uploaded',
  });
}

async function remove(req, res) {
  // publicId may contain slashes (folder path); routes use a wildcard param.
  const publicId = req.params.publicId || req.params[0];
  const result = await mediaService.deleteImage(publicId);
  return ApiResponse.send(res, { data: result, message: 'Image deleted' });
}

module.exports = { upload, remove };
