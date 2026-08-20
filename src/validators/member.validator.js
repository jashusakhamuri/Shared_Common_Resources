const Joi = require('joi');

const addMember = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('OWNER', 'VIEWER').default('VIEWER'),
});

module.exports = { addMember };
