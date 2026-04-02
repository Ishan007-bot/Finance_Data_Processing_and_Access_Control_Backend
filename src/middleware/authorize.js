const ApiError = require('../utils/apiError');

/**
 * Role-based authorization middleware.
 * Takes a list of allowed roles and returns a middleware
 * that checks if the authenticated user has one of those roles.
 *
 * Usage: authorize('admin', 'analyst')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // authenticate middleware must run before this
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
