const memberModel = require('../models/member.model');
const response = require('../utils/response');
const PERMISSIONS = require('../constants/permissions');

/**
 * authorizationMiddleware('UPLOAD_RESOURCE') looks up the caller's role in
 * space_members for req.params.spaceId and blocks with 403 if their role
 * isn't in the allowed list for that action.
 *
 * This is the real security boundary — never trust a hidden frontend button.
 */
function authorizationMiddleware(permissionKey) {
  const allowedRoles = PERMISSIONS[permissionKey];
  if (!allowedRoles) {
    throw new Error(`Unknown permission key: ${permissionKey}`);
  }

  return async function (req, res, next) {
    try {
      const spaceId = req.params.spaceId || req.body.spaceId;
      if (!spaceId) return response.error(res, 400, 'spaceId is required');

      const membership = await memberModel.findMembership(spaceId, req.user.id);
      if (!membership) {
        return response.error(res, 403, 'You are not a member of this space');
      }
      if (!allowedRoles.includes(membership.role)) {
        return response.error(res, 403, 'You do not have permission to perform this operation');
      }

      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = authorizationMiddleware;
