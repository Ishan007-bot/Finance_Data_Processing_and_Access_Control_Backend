const mongoose = require('mongoose');
const environment = require('./environment');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    await mongoose.connect(environment.mongodb.uri);
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

module.exports = connectDatabase;
