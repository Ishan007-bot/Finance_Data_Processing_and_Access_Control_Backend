const userService = require('./user.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { users, pagination } = await userService.getUsers(req.query);

    apiResponse.paginated(res, 'Users retrieved successfully', users, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    apiResponse.success(res, 200, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user._id
    );

    apiResponse.success(res, 200, 'User role updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status,
      req.user._id
    );

    apiResponse.success(res, 200, 'User status updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};
