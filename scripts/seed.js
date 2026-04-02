const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/user.model');
const FinancialRecord = require('../src/models/record.model');
const environment = require('../src/config/environment');
const logger = require('../src/utils/logger');

const SALT_ROUNDS = 10;

/**
 * Seed data for the database.
 * Creates an admin user and sample financial records for testing.
 */
const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@zorvyn.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Analyst User',
    email: 'analyst@zorvyn.com',
    password: 'analyst123',
    role: 'analyst',
    status: 'active',
  },
  {
    name: 'Viewer User',
    email: 'viewer@zorvyn.com',
    password: 'viewer123',
    role: 'viewer',
    status: 'active',
  },
];

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Rental Income'],
  expense: ['Rent', 'Utilities', 'Groceries', 'Transport', 'Entertainment', 'Insurance', 'Office Supplies'],
};

/**
 * Generate sample financial records spread across the last 12 months.
 */
const generateRecords = (adminId) => {
  const records = [];
  const now = new Date();

  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const recordDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    // Add 2-3 income records per month
    const incomeCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < incomeCount; i++) {
      const category = categories.income[Math.floor(Math.random() * categories.income.length)];
      const day = 1 + Math.floor(Math.random() * 28);
      records.push({
        amount: parseFloat((1000 + Math.random() * 9000).toFixed(2)),
        type: 'income',
        category,
        date: new Date(recordDate.getFullYear(), recordDate.getMonth(), day),
        description: `${category} payment for ${recordDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        createdBy: adminId,
      });
    }

    // Add 3-5 expense records per month
    const expenseCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < expenseCount; i++) {
      const category = categories.expense[Math.floor(Math.random() * categories.expense.length)];
      const day = 1 + Math.floor(Math.random() * 28);
      records.push({
        amount: parseFloat((50 + Math.random() * 2000).toFixed(2)),
        type: 'expense',
        category,
        date: new Date(recordDate.getFullYear(), recordDate.getMonth(), day),
        description: `${category} for ${recordDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        createdBy: adminId,
      });
    }
  }

  return records;
};

const seed = async () => {
  try {
    await mongoose.connect(environment.mongodb.uri);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        status: userData.status,
      });
      createdUsers.push(user);
      logger.info(`Created user: ${user.email} (${user.role})`);
    }

    const adminUser = createdUsers[0];

    // Create financial records
    const records = generateRecords(adminUser._id);
    await FinancialRecord.insertMany(records);
    logger.info(`Created ${records.length} financial records`);

    // Print login credentials
    logger.info('');
    logger.info('=== Seed Complete ===');
    logger.info('Login credentials:');
    seedUsers.forEach((u) => {
      logger.info(`  ${u.role.padEnd(8)} | ${u.email} | password: ${u.password}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
