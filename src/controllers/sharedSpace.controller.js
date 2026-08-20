const sharedSpaceService = require('../services/sharedSpace.service');
const response = require('../utils/response');

async function create(req, res, next) {
  try {
    const space = await sharedSpaceService.createSpace({ ...req.body, userId: req.user.id });
    return response.success(res, 201, space);
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const spaces = await sharedSpaceService.listMySpaces(req.user.id);
    return response.success(res, 200, spaces);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const space = await sharedSpaceService.getSpace(req.params.spaceId);
    return response.success(res, 200, space);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const space = await sharedSpaceService.updateSpace(req.params.spaceId, req.body);
    return response.success(res, 200, space);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await sharedSpaceService.deleteSpace(req.params.spaceId, req.user.id);
    return response.success(res, 200, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, getOne, update, remove };
