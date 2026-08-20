const memberModel = require('../models/member.model');
const userModel = require('../models/user.model');
const auditService = require('./audit.service');
const ROLES = require('../constants/roles');

async function addMember({ spaceId, email, role, invitedBy }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    const err = new Error('No user found with that email');
    err.status = 404;
    throw err;
  }
  const membership = await memberModel.addMember({
    spaceId,
    userId: user.id,
    role: role || ROLES.VIEWER,
  });
  if (!membership) {
    const err = new Error('User is already a member of this space');
    err.status = 409;
    throw err;
  }
  await auditService.log({ userId: invitedBy, spaceId, action: 'MEMBER_ADDED', metadata: { newMemberId: user.id } });
  return membership;
}

function listMembers(spaceId) {
  return memberModel.listMembers(spaceId);
}

async function removeMember(spaceId, userId, removedBy) {
  await memberModel.removeMember(spaceId, userId);
  await auditService.log({ userId: removedBy, spaceId, action: 'MEMBER_REMOVED', metadata: { removedUserId: userId } });
}

module.exports = { addMember, listMembers, removeMember };
