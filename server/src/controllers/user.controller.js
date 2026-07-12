const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');

async function getProfile(req, res) {
  const profile = await userService.getProfile(req.params.userId);
  return ApiResponse.send(res, { data: { user: profile }, message: 'OK' });
}

async function updateMe(req, res) {
  const user = await userService.updateProfile(req.user.id, req.body);
  return ApiResponse.send(res, { data: { user }, message: 'Profile updated' });
}

async function follow(req, res) {
  const result = await userService.toggleFollow(req.params.userId, req.user.id);
  return ApiResponse.send(res, { data: result, message: result.following ? 'Following' : 'Unfollowed' });
}

module.exports = { getProfile, updateMe, follow };
