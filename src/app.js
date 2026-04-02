const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const apiResponse = require('./utils/apiResponse');

const app = express();

// --------------- Global Middleware ---------------

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins (suitable for development)
app.use(cors());

// HTTP request logging
app.use(morgan('dev'));

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// --------------- API Documentation ---------------

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Zorvyn Finance API Docs',
}));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/api/health', (req, res) => {
  apiResponse.success(res, 200, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// --------------- API Routes ---------------
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const recordRoutes = require('./modules/records/record.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --------------- 404 Handler ---------------

app.use((req, res) => {
  apiResponse.error(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
});

// --------------- Global Error Handler ---------------

app.use(errorHandler);

module.exports = app;
