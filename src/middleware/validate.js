const ApiError = require('../utils/apiError');

/**
 * Request validation middleware using Joi schemas.
 * Validates req.body, req.params, or req.query based on the schema provided.
 *
 * Usage: validate(schema, 'body')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,   // Return all errors, not just the first
      stripUnknown: true,  // Remove unknown fields
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(ApiError.badRequest(messages.join('. ')));
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

module.exports = validate;
