const Joi = require('joi');

const base = {
  title: Joi.string().min(2).max(120),
  company: Joi.string().min(2).max(120),
  location: Joi.string().allow('', null),
  description: Joi.string().min(10),
  skills: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string() 
  ),
  type: Joi.string().allow('', null),
  salary: Joi.alternatives().try(Joi.string(), Joi.object()),
  
  companyLogoUrl: Joi.string().uri().optional(),
};

const createJobSchema = Joi.object({
  ...base,
  title: base.title.required(),
  company: base.company.required(),
  description: base.description.required(),
});

const updateJobSchema = Joi.object(base);

module.exports = { createJobSchema, updateJobSchema };
