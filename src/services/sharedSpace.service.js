const sharedSpaceModel = require('../models/sharedSpace.model');
const memberModel = require('../models/member.model');
const auditService = require('./audit.service');
const ROLES = require('../constants/roles');

async function createSpace({ name, description, userId }) {
  const space = await sharedSpaceModel.create({ name, description, createdBy: userId });
  // creator automatically becomes OWNER
  await memberModel.addMember({ spaceId: space.id, userId, role: ROLES.OWNER });
  await auditService.log({ userId, spaceId: space.id, action: 'SPACE_CREATED' });
  return space;
}

function listMySpaces(userId) {
  return sharedSpaceModel.findAllForUser(userId);
}

async function getSpace(spaceId) {
  const space = await sharedSpaceModel.findById(spaceId);
  if (!space) {
    const err = new Error('Shared space not found');
    err.status = 404;
    throw err;
  }
  return space;
}

async function updateSpace(spaceId, updates) {
  return sharedSpaceModel.update(spaceId, updates);
}

async function deleteSpace(spaceId, userId) {
  await sharedSpaceModel.deactivate(spaceId);
  await auditService.log({ userId, spaceId, action: 'SPACE_DELETED' });
}

module.exports = { createSpace, listMySpaces, getSpace, updateSpace, deleteSpace };
