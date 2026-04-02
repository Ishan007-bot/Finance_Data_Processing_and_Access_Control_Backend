const authService = require('./auth.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);

    apiResponse.success(res, 201, 'User registered successfully', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    apiResponse.success(res, 200, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);

    apiResponse.success(res, 200, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
