const User = require('../../models/user.model');
const ApiError = require('../../utils/apiError');

/**
 * Get all users with optional filtering and pagination.
 */
const getUsers = async ({ page = 1, limit = 10, role, status }) => {
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      limit,
    },
  };
};

/**
 * Get a single user by ID.
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

/**
 * Update a user's role.
 * Prevents an admin from changing their own role (safety measure).
 */
const updateUserRole = async (userId, newRole, requestingUserId) => {
  if (userId === requestingUserId.toString()) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.role = newRole;
  await user.save();

  return user;
};

/**
 * Update a user's status (active/inactive).
 * Prevents an admin from deactivating themselves.
 */
const updateUserStatus = async (userId, newStatus, requestingUserId) => {
  if (userId === requestingUserId.toString()) {
    throw ApiError.badRequest('You cannot change your own status');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.status = newStatus;
  await user.save();

  return user;
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};
