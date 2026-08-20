const path = require('path');
const fs = require('fs');
const env = require('./env');

const UPLOAD_ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR);

function spaceDir(spaceId) {
  return path.join(UPLOAD_ROOT, 'spaces', spaceId, 'resources');
}

function ensureSpaceDir(spaceId) {
  const dir = spaceDir(spaceId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function absolutePathFromStorageKey(storageKey) {
  return path.join(UPLOAD_ROOT, storageKey);
}

module.exports = { UPLOAD_ROOT, spaceDir, ensureSpaceDir, absolutePathFromStorageKey };
