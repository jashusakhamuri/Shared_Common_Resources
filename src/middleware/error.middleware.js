const response = require('../utils/response');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
module.exports = function errorMiddleware(err, req, res, next) {
  logger.error({ err }, 'Unhandled error');

  if (err.name === 'MulterError' || /File type not allowed/.test(err.message)) {
    return response.error(res, 400, err.message);
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return response.error(res, status, message);
};
