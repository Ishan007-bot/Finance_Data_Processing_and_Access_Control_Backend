const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user.model');
const FinancialRecord = require('../src/models/record.model');
const environment = require('../src/config/environment');

const TEST_DB_URI = environment.mongodb.uri + '_test';

/**
 * Connect to the test database before running tests.
 */
const connectTestDB = async () => {
  await mongoose.connect(TEST_DB_URI);
};

/**
 * Clear all collections in the test database.
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Disconnect from the test database after all tests.
 */
const disconnectTestDB = async () => {
  await clearDatabase();
  await mongoose.connection.close();
};

/**
 * Create a test user and return the user object + JWT token.
 */
const createTestUser = async (overrides = {}) => {
  const defaults = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: 'viewer',
    status: 'active',
  };

  const userData = { ...defaults, ...overrides };
  const passwordHash = await bcrypt.hash(userData.password, 10);

  const user = await User.create({
    name: userData.name,
    email: userData.email,
    passwordHash,
    role: userData.role,
    status: userData.status,
  });

  const token = jwt.sign({ id: user._id }, environment.jwt.secret, {
    expiresIn: environment.jwt.expiresIn,
  });

  return { user, token, password: userData.password };
};

/**
 * Create a test financial record.
 */
const createTestRecord = async (userId, overrides = {}) => {
  const defaults = {
    amount: 1000,
    type: 'income',
    category: 'Salary',
    date: new Date('2025-03-15'),
    description: 'Test record',
    createdBy: userId,
  };

  const recordData = { ...defaults, ...overrides };
  const record = await FinancialRecord.create(recordData);
  return record;
};

module.exports = {
  connectTestDB,
  clearDatabase,
  disconnectTestDB,
  createTestUser,
  createTestRecord,
};
