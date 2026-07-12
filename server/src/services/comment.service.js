const mongoose = require('mongoose');
const { Comment, Recipe } = require('../models');
const ApiError = require('../utils/ApiError');

const AUTHOR_FIELDS = 'name avatar';

async function getTopLevelComments(recipeId, page = 1, limit = 10) {
  if (!mongoose.isValidObjectId(recipeId)) throw ApiError.badRequest('Invalid recipe id');
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  const filter = { recipe: recipeId, parent: null, isDeleted: false };

  const [comments, total] = await Promise.all([
    Comment.find(filter).populate('author', AUTHOR_FIELDS).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    Comment.countDocuments(filter),
  ]);

  // Attach replyCount for each top-level comment.
  const ids = comments.map((c) => c._id);
  const counts = await Comment.aggregate([
    { $match: { parent: { $in: ids } } },
    { $group: { _id: '$parent', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  comments.forEach((c) => {
    c.replyCount = countMap.get(String(c._id)) || 0;
  });

  return { comments, total, page: p, pages: Math.ceil(total / l) || 1 };
}

async function getReplies(commentId) {
  if (!mongoose.isValidObjectId(commentId)) throw ApiError.badRequest('Invalid comment id');
  return Comment.find({ parent: commentId, isDeleted: false })
    .populate('author', AUTHOR_FIELDS)
    .sort({ createdAt: 1 })
    .lean();
}

async function createComment(recipeId, authorId, content, parentId = null) {
  if (!mongoose.isValidObjectId(recipeId)) throw ApiError.badRequest('Invalid recipe id');
  const recipe = await Recipe.exists({ _id: recipeId });
  if (!recipe) throw ApiError.notFound('Recipe not found');

  if (parentId) {
    if (!mongoose.isValidObjectId(parentId)) throw ApiError.badRequest('Invalid parent id');
    const parent = await Comment.findById(parentId).select('recipe').lean();
    if (!parent) throw ApiError.notFound('Parent comment not found');
    if (String(parent.recipe) !== String(recipeId)) {
      throw ApiError.badRequest('Parent comment belongs to a different recipe');
    }
  }

  const comment = await Comment.create({
    recipe: recipeId,
    author: authorId,
    content: content.trim(),
    parent: parentId || null,
  });
  return comment.populate('author', AUTHOR_FIELDS);
}

async function updateComment(commentId, userId, content) {
  if (!mongoose.isValidObjectId(commentId)) throw ApiError.badRequest('Invalid comment id');
  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted) throw ApiError.notFound('Comment not found');
  if (String(comment.author) !== String(userId)) {
    throw ApiError.forbidden('You can only edit your own comments');
  }
  comment.content = content.trim();
  await comment.save();
  return comment.populate('author', AUTHOR_FIELDS);
}

async function softDeleteComment(commentId, userId) {
  if (!mongoose.isValidObjectId(commentId)) throw ApiError.badRequest('Invalid comment id');
  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted) throw ApiError.notFound('Comment not found');
  if (String(comment.author) !== String(userId)) {
    throw ApiError.forbidden('You can only delete your own comments');
  }
  await comment.softDelete();
  return { id: commentId };
}

async function toggleLike(commentId, userId) {
  if (!mongoose.isValidObjectId(commentId)) throw ApiError.badRequest('Invalid comment id');
  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted) throw ApiError.notFound('Comment not found');

  const alreadyLiked = comment.likes.some((id) => String(id) === String(userId));
  if (alreadyLiked) {
    await Comment.updateOne({ _id: commentId }, { $pull: { likes: userId } });
  } else {
    await Comment.updateOne({ _id: commentId }, { $addToSet: { likes: userId } });
  }
  const count = alreadyLiked ? comment.likes.length - 1 : comment.likes.length + 1;
  return { liked: !alreadyLiked, count };
}

module.exports = {
  getTopLevelComments,
  getReplies,
  createComment,
  updateComment,
  softDeleteComment,
  toggleLike,
};
