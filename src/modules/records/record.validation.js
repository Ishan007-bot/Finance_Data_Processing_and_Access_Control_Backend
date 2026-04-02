const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be greater than zero',
      'any.required': 'Amount is required',
    }),

  type: Joi.string().valid('income', 'expense').required()
    .messages({
      'any.only': 'Type must be either income or expense',
      'any.required': 'Type is required',
    }),

  category: Joi.string().trim().min(1).max(50).required()
    .messages({
      'string.min': 'Category cannot be empty',
      'string.max': 'Category must be at most 50 characters',
      'any.required': 'Category is required',
    }),

  date: Joi.date().iso().required()
    .messages({
      'date.format': 'Date must be a valid ISO 8601 date',
      'any.required': 'Date is required',
    }),

  description: Joi.string().trim().max(500).allow('').optional()
    .messages({
      'string.max': 'Description must be at most 500 characters',
    }),
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2)
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be greater than zero',
    }),

  type: Joi.string().valid('income', 'expense')
    .messages({
      'any.only': 'Type must be either income or expense',
    }),

  category: Joi.string().trim().min(1).max(50)
    .messages({
      'string.min': 'Category cannot be empty',
      'string.max': 'Category must be at most 50 characters',
    }),

  date: Joi.date().iso()
    .messages({
      'date.format': 'Date must be a valid ISO 8601 date',
    }),

  description: Joi.string().trim().max(500).allow('')
    .messages({
      'string.max': 'Description must be at most 500 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const recordIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
    .messages({
      'string.hex': 'Invalid record ID format',
      'string.length': 'Invalid record ID format',
      'any.required': 'Record ID is required',
    }),
});

const listRecordsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
    .messages({
      'date.min': 'End date must be after start date',
    }),
  sortBy: Joi.string().valid('date', 'amount', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  listRecordsQuerySchema,
};
