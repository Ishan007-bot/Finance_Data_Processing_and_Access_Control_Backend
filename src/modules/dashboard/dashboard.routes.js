const express = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// All dashboard routes require authentication + admin or analyst role
router.use(authenticate, authorize('admin', 'analyst'));

router.get('/summary', dashboardController.getSummary);
router.get('/category-totals', dashboardController.getCategoryTotals);
router.get('/trends', dashboardController.getMonthlyTrends);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
