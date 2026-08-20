const pool = require('../config/db');

async function addMember({ spaceId, userId, role }) {
  const { rows } = await pool.query(
    `INSERT INTO space_members (space_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (space_id, user_id) DO NOTHING
     RETURNING *`,
    [spaceId, userId, role]
  );
  return rows[0] || null;
}

async function findMembership(spaceId, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM space_members WHERE space_id = $1 AND user_id = $2`,
    [spaceId, userId]
  );
  return rows[0] || null;
}

async function listMembers(spaceId) {
  const { rows } = await pool.query(
    `SELECT sm.id, sm.role, sm.joined_at, u.id AS user_id, u.full_name, u.email
     FROM space_members sm
     JOIN users u ON u.id = sm.user_id
     WHERE sm.space_id = $1
     ORDER BY sm.joined_at ASC`,
    [spaceId]
  );
  return rows;
}

async function removeMember(spaceId, userId) {
  await pool.query(`DELETE FROM space_members WHERE space_id = $1 AND user_id = $2`, [
    spaceId,
    userId,
  ]);
}

module.exports = { addMember, findMembership, listMembers, removeMember };
