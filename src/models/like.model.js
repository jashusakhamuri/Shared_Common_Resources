const pool = require('../config/db');

async function hasLiked(resourceId, userId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM resource_likes WHERE resource_id = $1 AND user_id = $2`,
    [resourceId, userId]
  );
  return rows.length > 0;
}

async function addLike(resourceId, userId) {
  await pool.query(
    `INSERT INTO resource_likes (resource_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (resource_id, user_id) DO NOTHING`,
    [resourceId, userId]
  );
}

async function removeLike(resourceId, userId) {
  await pool.query(`DELETE FROM resource_likes WHERE resource_id = $1 AND user_id = $2`, [
    resourceId,
    userId,
  ]);
}

async function countLikes(resourceId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM resource_likes WHERE resource_id = $1`,
    [resourceId]
  );
  return rows[0].count;
}

module.exports = { hasLiked, addLike, removeLike, countLikes };
