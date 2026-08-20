const fs = require('fs');
const path = require('path');
const storageConfig = require('../config/storage');
const resourceTypes = require('../constants/resourceTypes');

function resourceTypeFromMime(mime) {
  if (mime.startsWith('image/')) return resourceTypes.IMAGE;
  if (mime.startsWith('video/')) return resourceTypes.VIDEO;
  if (mime.startsWith('audio/')) return resourceTypes.AUDIO;
  if (mime === 'application/pdf' || mime.startsWith('application/vnd.openxmlformats') || mime === 'application/msword') {
    return resourceTypes.DOCUMENT;
  }
  if (mime === 'application/zip') return resourceTypes.ARCHIVE;
  return resourceTypes.OTHER;
}

// Multer already wrote the file to disk; we just compute the relative
// "storage_key" that gets saved in Postgres.
function storageKeyFor(spaceId, filename) {
  return path.posix.join('spaces', spaceId, 'resources', filename);
}

function streamFile(storageKey, res, rangeHeader) {
  const absPath = storageConfig.absolutePathFromStorageKey(storageKey);
  const stat = fs.statSync(absPath);

  if (!rangeHeader) {
    res.writeHead(200, { 'Content-Length': stat.size });
    fs.createReadStream(absPath).pipe(res);
    return;
  }

  // Supports HTTP Range requests so MP4/MP3 can be seeked, not just downloaded whole.
  const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
  });
  fs.createReadStream(absPath, { start, end }).pipe(res);
}

module.exports = { resourceTypeFromMime, storageKeyFor, streamFile };
