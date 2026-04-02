const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
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

// --------------- Health Check ---------------

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

app.use('/api/auth', authRoutes);
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
