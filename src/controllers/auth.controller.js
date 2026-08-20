const authService = require('../services/auth.service');
const response = require('../utils/response');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return response.success(res, 201, user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return response.success(res, 200, result);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const result = authService.refresh(req.body.refreshToken);
    return response.success(res, 200, result);
  } catch (err) {
    err.status = 401;
    err.message = 'Invalid or expired refresh token';
    next(err);
  }
}

module.exports = { register, login, refresh };
