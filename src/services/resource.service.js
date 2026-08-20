const resourceModel = require('../models/resource.model');
const memberModel = require('../models/member.model');
const storageService = require('./storage.service');
const realtimeService = require('./realtime.service');
const auditService = require('./audit.service');

async function createText({ spaceId, userId, title, content }) {
  const resource = await resourceModel.createText({ spaceId, uploadedBy: userId, title, content });
  const shaped = shapeResource(resource, { postedBy: null });
  realtimeService.publishNewResource(spaceId, shaped);
  await auditService.log({ userId, spaceId, resourceId: resource.id, action: 'RESOURCE_UPLOADED' });
  return shaped;
}

async function createFromUpload({ spaceId, userId, file, title }) {
  const resourceType = storageService.resourceTypeFromMime(file.mimetype);
  const storageKey = storageService.storageKeyFor(spaceId, file.filename);

  const resource = await resourceModel.createFile({
    spaceId,
    uploadedBy: userId,
    resourceType,
    title,
    originalName: file.originalname,
    storageKey,
    mimeType: file.mimetype,
    fileSize: file.size,
  });

  const shaped = shapeResource(resource, { postedBy: null });
  realtimeService.publishNewResource(spaceId, shaped);
  await auditService.log({ userId, spaceId, resourceId: resource.id, action: 'RESOURCE_UPLOADED' });
  return shaped;
}

async function getFeed(spaceId, pagination) {
  return resourceModel.findFeedBySpace(spaceId, pagination);
}

async function getResourceForMember(resourceId, userId) {
  const resource = await resourceModel.findById(resourceId);
  if (!resource) {
    const err = new Error('Resource not found');
    err.status = 404;
    throw err;
  }
  const membership = await memberModel.findMembership(resource.space_id, userId);
  if (!membership) {
    const err = new Error('You are not a member of this space');
    err.status = 403;
    throw err;
  }
  return resource;
}

function shapeResource(row, extra = {}) {
  return {
    id: row.id,
    spaceId: row.space_id,
    resourceType: row.resource_type,
    title: row.title,
    originalName: row.original_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    content: row.text_content,
    likeCount: 0,
    createdAt: row.created_at,
    ...extra,
  };
}

module.exports = { createText, createFromUpload, getFeed, getResourceForMember };
