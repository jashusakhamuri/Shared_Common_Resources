const Joi = require('joi');

const register = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refresh = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { register, login, refresh };
