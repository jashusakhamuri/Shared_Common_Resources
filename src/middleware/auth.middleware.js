const jwt = require('../utils/jwt');
const response = require('../utils/response');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  let token = header.startsWith('Bearer ') ? header.slice(7) : null;

  // HTML <video>/<audio>/<img> tags can't send an Authorization header, so
  // for streaming/downloading a file we also accept ?token=... in the URL.
  // Everything else (JSON API calls from the demo UI) still uses the header.
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) return response.error(res, 401, 'Missing bearer token');

  try {
    const payload = jwt.verifyAccessToken(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return response.error(res, 401, 'Invalid or expired token');
  }
};
