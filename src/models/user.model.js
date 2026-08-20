const pool = require('../config/db');

async function create({ fullName, email, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, created_at`,
    [fullName, email, passwordHash]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, created_at FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { create, findByEmail, findById };
