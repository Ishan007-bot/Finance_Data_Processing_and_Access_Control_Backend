const ApiError = require('../utils/apiError');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Global error handling middleware.
 * Catches all errors thrown in the app and returns a consistent response.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details for debugging
  logger.error(`${err.name}: ${err.message}`);

  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  // Handle known operational errors (ApiError instances)
  if (err instanceof ApiError) {
    return apiResponse.error(res, err.statusCode, err.message);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return apiResponse.error(res, 400, 'Validation failed', messages);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return apiResponse.error(
      res,
      409,
      `Duplicate value for '${field}'. This ${field} already exists.`
    );
  }

  // Handle Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return apiResponse.error(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return apiResponse.error(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return apiResponse.error(res, 401, 'Token has expired');
  }

  // Fallback for unknown errors
  return apiResponse.error(
    res,
    500,
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong'
  );
};

module.exports = errorHandler;
