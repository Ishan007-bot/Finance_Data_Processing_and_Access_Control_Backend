const Joi = require('joi');

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'analyst', 'viewer').required()
    .messages({
      'any.only': 'Role must be one of: admin, analyst, viewer',
      'any.required': 'Role is required',
    }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required()
    .messages({
      'any.only': 'Status must be one of: active, inactive',
      'any.required': 'Status is required',
    }),
});

const userIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
    .messages({
      'string.hex': 'Invalid user ID format',
      'string.length': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),
});

// Query params for listing users
const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid('admin', 'analyst', 'viewer'),
  status: Joi.string().valid('active', 'inactive'),
});

module.exports = {
  updateRoleSchema,
  updateStatusSchema,
  userIdParamSchema,
  listUsersQuerySchema,
};
