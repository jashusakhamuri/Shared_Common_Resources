const likeService = require('../services/like.service');
const response = require('../utils/response');

async function toggle(req, res, next) {
  try {
    const result = await likeService.toggleLike(req.params.id, req.user.id);
    return response.success(res, 200, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { toggle };
