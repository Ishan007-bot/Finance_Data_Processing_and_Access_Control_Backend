const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zorvyn Finance API',
      version: '1.0.0',
      description: 'Finance Data Processing and Access Control Backend API',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661f1a2b3c4d5e6f7a8b9c0d' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['admin', 'analyst', 'viewer'], example: 'viewer' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FinancialRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661f1a2b3c4d5e6f7a8b9c0e' },
            amount: { type: 'number', example: 5000 },
            type: { type: 'string', enum: ['income', 'expense'], example: 'income' },
            category: { type: 'string', example: 'Salary' },
            date: { type: 'string', format: 'date', example: '2025-03-01' },
            description: { type: 'string', example: 'March salary payment' },
            createdBy: { type: 'string', example: '661f1a2b3c4d5e6f7a8b9c0d' },
            isDeleted: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 5 },
            totalRecords: { type: 'integer', example: 50 },
            limit: { type: 'integer', example: 10 },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoint' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Records', description: 'Financial records management' },
      { name: 'Dashboard', description: 'Dashboard analytics (Admin and Analyst)' },
    ],
  },
  apis: ['./src/modules/**/*.routes.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
