const app = require('./src/app');
const connectDatabase = require('./src/config/database');
const environment = require('./src/config/environment');
const logger = require('./src/utils/logger');

const startServer = async () => {
  // Connect to MongoDB
  await connectDatabase();

  // Start listening
  app.listen(environment.port, () => {
    logger.info(`Server running on port ${environment.port}`);
    logger.info(`Environment: ${environment.nodeEnv}`);
    logger.info(`Health check: http://localhost:${environment.port}/api/health`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  process.exit(1);
});

startServer();
