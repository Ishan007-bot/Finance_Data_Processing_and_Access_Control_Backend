const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const environment = require('../config/environment');

/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header
 * and attaches the user object to the request.
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, environment.jwt.secret);

    // Find user and check if they still exist and are active
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Attach user to request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    // Pass JWT-specific errors directly (handled by errorHandler)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    next(error);
  }
};

module.exports = authenticate;
