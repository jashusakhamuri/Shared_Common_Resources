const pool = require('../config/db');

async function createText({ spaceId, uploadedBy, title, content }) {
  const { rows } = await pool.query(
    `INSERT INTO resources (space_id, uploaded_by, resource_type, title, text_content)
     VALUES ($1, $2, 'TEXT', $3, $4)
     RETURNING *`,
    [spaceId, uploadedBy, title || null, content]
  );
  return rows[0];
}

async function createFile({
  spaceId,
  uploadedBy,
  resourceType,
  title,
  originalName,
  storageKey,
  mimeType,
  fileSize,
}) {
  const { rows } = await pool.query(
    `INSERT INTO resources
       (space_id, uploaded_by, resource_type, title, original_name, storage_key, mime_type, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [spaceId, uploadedBy, resourceType, title || originalName, originalName, storageKey, mimeType, fileSize]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM resources WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );
  return rows[0] || null;
}

async function findFeedBySpace(spaceId, { limit = 20, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT r.id, r.space_id, r.resource_type, r.title, r.original_name,
            r.mime_type, r.file_size, r.text_content, r.created_at,
            u.full_name AS posted_by,
            COUNT(l.id)::int AS like_count
     FROM resources r
     JOIN users u ON u.id = r.uploaded_by
     LEFT JOIN resource_likes l ON l.resource_id = r.id
     WHERE r.space_id = $1 AND r.is_deleted = FALSE
     GROUP BY r.id, u.full_name
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [spaceId, limit, offset]
  );
  return rows;
}

async function softDelete(id) {
  await pool.query(`UPDATE resources SET is_deleted = TRUE WHERE id = $1`, [id]);
}

module.exports = { createText, createFile, findById, findFeedBySpace, softDelete };
