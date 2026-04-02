const express = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// All dashboard routes require authentication + admin or analyst role
router.use(authenticate, authorize('admin', 'analyst'));

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get overall financial summary
 *     description: Returns total income, total expenses, net balance, and total record count
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved
 *       403:
 *         description: Admin or Analyst access required
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @swagger
 * /api/dashboard/category-totals:
 *   get:
 *     summary: Get category-wise totals
 *     description: Returns amounts grouped by category and type (income/expense)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category totals retrieved
 *       403:
 *         description: Admin or Analyst access required
 */
router.get('/category-totals', dashboardController.getCategoryTotals);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get monthly trends
 *     description: Returns income, expenses, and net for each month over the last 12 months
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends retrieved
 *       403:
 *         description: Admin or Analyst access required
 */
router.get('/trends', dashboardController.getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent financial activity
 *     description: Returns the most recent N financial records
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent records to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved
 *       403:
 *         description: Admin or Analyst access required
 */
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
