
const Joi = require('joi');

const applySchema = Joi.object({
  coverLetter: Joi.string().allow('')
});

module.exports = { applySchema };
