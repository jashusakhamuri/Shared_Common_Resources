const Joi = require('joi');

const createText = Joi.object({
  title: Joi.string().max(255).allow('', null),
  content: Joi.string().min(1).max(20000).required(),
});

module.exports = { createText };
