const commentService = require('../services/comment.service');
const ApiResponse = require('../utils/ApiResponse');

async function listForRecipe(req, res) {
  const { comments, total, page, pages } = await commentService.getTopLevelComments(
    req.params.recipeId,
    req.query.page,
    req.query.limit
  );
  return ApiResponse.send(res, { data: comments, message: 'OK', meta: { total, page, pages } });
}

async function listReplies(req, res) {
  const replies = await commentService.getReplies(req.params.commentId);
  return ApiResponse.send(res, { data: replies, message: 'OK' });
}

async function create(req, res) {
  const comment = await commentService.createComment(
    req.params.recipeId,
    req.user.id,
    req.body.content,
    req.body.parent || null
  );
  return ApiResponse.send(res, { statusCode: 201, data: { comment }, message: 'Comment posted' });
}

async function reply(req, res) {
  const parent = req.params.commentId;
  const comment = await commentService.createComment(
    req.body.recipe,
    req.user.id,
    req.body.content,
    parent
  );
  return ApiResponse.send(res, { statusCode: 201, data: { comment }, message: 'Reply posted' });
}

async function update(req, res) {
  const comment = await commentService.updateComment(req.params.commentId, req.user.id, req.body.content);
  return ApiResponse.send(res, { data: { comment }, message: 'Comment updated' });
}

async function remove(req, res) {
  const result = await commentService.softDeleteComment(req.params.commentId, req.user.id);
  return ApiResponse.send(res, { data: result, message: 'Comment deleted' });
}

async function like(req, res) {
  const result = await commentService.toggleLike(req.params.commentId, req.user.id);
  return ApiResponse.send(res, { data: result, message: result.liked ? 'Liked' : 'Unliked' });
}

module.exports = { listForRecipe, listReplies, create, reply, update, remove, like };
