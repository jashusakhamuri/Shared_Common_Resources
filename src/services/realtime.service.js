const socket = require('../config/socket');
const EVENTS = require('../constants/socketEvents');

function publishNewResource(spaceId, resource) {
  socket.broadcastToSpace(spaceId, {
    event: EVENTS.NEW_POST,
    data: { ...resource, spaceId },
  });
}

function publishLikeUpdate(spaceId, resourceId, likeCount) {
  socket.broadcastToSpace(spaceId, {
    event: EVENTS.LIKE_UPDATED,
    data: { resourceId, likeCount, spaceId },
  });
}

function publishMemberJoined(spaceId, member) {
  socket.broadcastToSpace(spaceId, {
    event: EVENTS.MEMBER_JOINED,
    data: { ...member, spaceId },
  });
}

module.exports = { publishNewResource, publishLikeUpdate, publishMemberJoined };
