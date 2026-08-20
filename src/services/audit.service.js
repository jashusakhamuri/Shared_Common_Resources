const auditLogModel = require('../models/auditLog.model');
const logger = require('../utils/logger');

async function log(entry) {
  try {
    await auditLogModel.record(entry);
  } catch (err) {
    // Auditing must never break the main request flow
    logger.error({ err }, 'Failed to write audit log');
  }
}

module.exports = { log };
