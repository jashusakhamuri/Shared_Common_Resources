const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(2000).allow('', null),
});

const update = Joi.object({
  name: Joi.string().min(2).max(150),
  description: Joi.string().max(2000).allow('', null),
}).min(1);

module.exports = { create, update };
