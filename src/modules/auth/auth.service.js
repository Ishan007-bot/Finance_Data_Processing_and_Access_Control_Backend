const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const ApiError = require('../../utils/apiError');
const environment = require('../../config/environment');

const SALT_ROUNDS = 10;

/**
 * Generate a JWT token for a user.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, environment.jwt.secret, {
    expiresIn: environment.jwt.expiresIn,
  });
};

/**
 * Register a new user.
 * New users are assigned the 'viewer' role by default.
 */
const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user with default role
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'viewer',
    status: 'active',
  });

  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Login with email and password.
 * Returns user data and JWT token.
 */
const login = async ({ email, password }) => {
  // Find user and explicitly include passwordHash (excluded by default)
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  // Compare password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Get the currently authenticated user's profile.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

module.exports = {
  register,
  login,
  getProfile,
};
