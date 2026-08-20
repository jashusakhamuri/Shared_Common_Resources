const likeModel = require('../models/like.model');
const resourceService = require('./resource.service');
const realtimeService = require('./realtime.service');

async function toggleLike(resourceId, userId) {
  const resource = await resourceService.getResourceForMember(resourceId, userId);

  const alreadyLiked = await likeModel.hasLiked(resourceId, userId);
  if (alreadyLiked) {
    await likeModel.removeLike(resourceId, userId);
  } else {
    await likeModel.addLike(resourceId, userId);
  }

  const likeCount = await likeModel.countLikes(resourceId);
  realtimeService.publishLikeUpdate(resource.space_id, resourceId, likeCount);

  return { liked: !alreadyLiked, likeCount };
}

module.exports = { toggleLike };
