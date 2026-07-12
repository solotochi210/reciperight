const mongoose = require('mongoose');
const { User, Recipe } = require('../models');
const ApiError = require('../utils/ApiError');

async function getProfile(userId) {
  if (!mongoose.isValidObjectId(userId)) throw ApiError.badRequest('Invalid user id');
  const user = await User.findById(userId).lean();
  if (!user) throw ApiError.notFound('User not found');

  const [recipeCount] = await Promise.all([
    Recipe.countDocuments({ author: userId, isPublished: true }),
  ]);

  delete user.passwordHash;
  return {
    ...user,
    recipeCount,
    followerCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
  };
}

async function updateProfile(userId, data) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (data.name !== undefined) user.name = String(data.name).trim();
  if (data.bio !== undefined) user.bio = String(data.bio).trim();
  if (data.avatar !== undefined) user.avatar = data.avatar;

  await user.save();
  return user;
}

async function toggleFollow(targetId, followerId) {
  if (!mongoose.isValidObjectId(targetId)) throw ApiError.badRequest('Invalid user id');
  if (String(targetId) === String(followerId)) {
    throw ApiError.badRequest('You cannot follow yourself');
  }
  const target = await User.findById(targetId);
  if (!target) throw ApiError.notFound('User not found');

  const isFollowing = target.followers.some((id) => String(id) === String(followerId));

  if (isFollowing) {
    await Promise.all([
      User.updateOne({ _id: targetId }, { $pull: { followers: followerId } }),
      User.updateOne({ _id: followerId }, { $pull: { following: targetId } }),
    ]);
    return { following: false };
  }

  await Promise.all([
    User.updateOne({ _id: targetId }, { $addToSet: { followers: followerId } }),
    User.updateOne({ _id: followerId }, { $addToSet: { following: targetId } }),
  ]);
  return { following: true };
}

module.exports = { getProfile, updateProfile, toggleFollow };
