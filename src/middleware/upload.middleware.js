const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const storage = require('../config/storage');
const env = require('../config/env');

const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/', 'application/pdf', 'application/zip',
  'application/msword', 'application/vnd.openxmlformats-officedocument', 'text/plain'];

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = storage.ensureSpaceDir(req.params.spaceId);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = crypto.randomUUID();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${uniquePrefix}-${safeName}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ALLOWED_MIME_PREFIXES.some((p) => file.mimetype.startsWith(p));
  if (!allowed) {
    return cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
  cb(null, true);
}

const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = upload;
