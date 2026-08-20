const resourceService = require('../services/resource.service');
const storageService = require('../services/storage.service');
const response = require('../utils/response');

async function createText(req, res, next) {
  try {
    const resource = await resourceService.createText({
      spaceId: req.params.spaceId,
      userId: req.user.id,
      ...req.body,
    });
    return response.success(res, 201, resource);
  } catch (err) {
    next(err);
  }
}

async function upload(req, res, next) {
  try {
    if (!req.file) return response.error(res, 400, 'No file uploaded');
    const resource = await resourceService.createFromUpload({
      spaceId: req.params.spaceId,
      userId: req.user.id,
      file: req.file,
      title: req.body.title,
    });
    return response.success(res, 201, resource);
  } catch (err) {
    next(err);
  }
}

async function feed(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const resources = await resourceService.getFeed(req.params.spaceId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return response.success(res, 200, resources);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const resource = await resourceService.getResourceForMember(req.params.id, req.user.id);
    return response.success(res, 200, resource);
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const resource = await resourceService.getResourceForMember(req.params.id, req.user.id);
    if (!resource.storage_key) return response.error(res, 400, 'This resource has no file attached');
    res.setHeader('Content-Disposition', `attachment; filename="${resource.original_name}"`);
    res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
    storageService.streamFile(resource.storage_key, res);
  } catch (err) {
    next(err);
  }
}

async function stream(req, res, next) {
  try {
    const resource = await resourceService.getResourceForMember(req.params.id, req.user.id);
    if (!resource.storage_key) return response.error(res, 400, 'This resource has no file attached');
    res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
    storageService.streamFile(resource.storage_key, res, req.headers.range);
  } catch (err) {
    next(err);
  }
}

module.exports = { createText, upload, feed, getOne, download, stream };
