const rateLimit = require('express-rate-limit');
const environment = require('../config/environment');
const apiResponse = require('../utils/apiResponse');

/**
 * General rate limiter for all API routes.
 * Prevents abuse by limiting the number of requests per window.
 */
const generalLimiter = rateLimit({
  windowMs: environment.rateLimit.windowMs,
  max: environment.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    apiResponse.error(
      res,
      429,
      'Too many requests. Please try again later.'
    );
  },
});

/**
 * Stricter rate limiter for authentication routes.
 * Prevents brute force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    apiResponse.error(
      res,
      429,
      'Too many login attempts. Please try again after 15 minutes.'
    );
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
};
