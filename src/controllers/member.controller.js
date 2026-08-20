const memberService = require('../services/member.service');
const response = require('../utils/response');

async function add(req, res, next) {
  try {
    const membership = await memberService.addMember({
      spaceId: req.params.spaceId,
      email: req.body.email,
      role: req.body.role,
      invitedBy: req.user.id,
    });
    return response.success(res, 201, membership);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const members = await memberService.listMembers(req.params.spaceId);
    return response.success(res, 200, members);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await memberService.removeMember(req.params.spaceId, req.params.userId, req.user.id);
    return response.success(res, 200, { removed: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { add, list, remove };
