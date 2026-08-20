const pool = require('../config/db');

async function create({ name, description, createdBy }) {
  const { rows } = await pool.query(
    `INSERT INTO shared_spaces (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, description || null, createdBy]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM shared_spaces WHERE id = $1 AND is_active = TRUE`,
    [id]
  );
  return rows[0] || null;
}

async function findAllForUser(userId) {
  const { rows } = await pool.query(
    `SELECT s.*, sm.role AS my_role
     FROM shared_spaces s
     JOIN space_members sm ON sm.space_id = s.id
     WHERE sm.user_id = $1 AND s.is_active = TRUE
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return rows;
}

async function update(id, { name, description }) {
  const { rows } = await pool.query(
    `UPDATE shared_spaces
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, name, description]
  );
  return rows[0] || null;
}

async function deactivate(id) {
  await pool.query(`UPDATE shared_spaces SET is_active = FALSE WHERE id = $1`, [id]);
}

module.exports = { create, findById, findAllForUser, update, deactivate };
