const pool = require('../config/db');

async function record({ userId, spaceId, resourceId, action, ipAddress, metadata }) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, space_id, resource_id, action, ip_address, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId || null, spaceId || null, resourceId || null, action, ipAddress || null, metadata || null]
  );
}

module.exports = { record };
