const pino = require('pino');
const env = require('../config/env');

module.exports = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});
