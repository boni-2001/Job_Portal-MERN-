const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('seeker', 'recruiter', 'admin').default('seeker'),
  adminSecret: Joi.string().when('role', { is: 'admin', then: Joi.string().required(), otherwise: Joi.forbidden() })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required()
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
