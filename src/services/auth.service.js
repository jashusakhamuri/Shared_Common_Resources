const userModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/password');
const jwt = require('../utils/jwt');
const auditService = require('./audit.service');

async function register({ fullName, email, password }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('Email is already registered');
    err.status = 409;
    throw err;
  }
  const passwordHash = await hashPassword(password);
  const user = await userModel.create({ fullName, email, passwordHash });
  await auditService.log({ userId: user.id, action: 'USER_REGISTERED' });
  return user;
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = jwt.signAccessToken(tokenPayload);
  const refreshToken = jwt.signRefreshToken(tokenPayload);

  await auditService.log({ userId: user.id, action: 'USER_LOGIN' });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, fullName: user.full_name, email: user.email },
  };
}

function refresh(refreshToken) {
  const payload = jwt.verifyRefreshToken(refreshToken); // throws if invalid/expired
  const accessToken = jwt.signAccessToken({ id: payload.id, email: payload.email });
  return { accessToken };
}

module.exports = { register, login, refresh };
