// Mirrors the permission matrix from the design doc.
// authorization.middleware.js checks against this.
module.exports = {
  ADD_MEMBER: ['OWNER'],
  REMOVE_MEMBER: ['OWNER'],
  UPLOAD_RESOURCE: ['OWNER'],
  CREATE_TEXT: ['OWNER'],
  UPDATE_RESOURCE: ['OWNER'],
  DELETE_RESOURCE: ['OWNER'],
  DELETE_SPACE: ['OWNER'],
  UPDATE_SPACE: ['OWNER'],
  VIEW_RESOURCE: ['OWNER', 'VIEWER'],
  DOWNLOAD_RESOURCE: ['OWNER', 'VIEWER'],
  LIKE_RESOURCE: ['OWNER', 'VIEWER'],
};
