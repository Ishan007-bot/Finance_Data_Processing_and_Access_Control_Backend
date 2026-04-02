const dashboardService = require('./dashboard.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * GET /api/dashboard/summary
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();

    apiResponse.success(res, 200, 'Dashboard summary retrieved', { summary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/category-totals
 */
const getCategoryTotals = async (req, res, next) => {
  try {
    const categoryTotals = await dashboardService.getCategoryTotals();

    apiResponse.success(res, 200, 'Category totals retrieved', { categoryTotals });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/trends
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await dashboardService.getMonthlyTrends();

    apiResponse.success(res, 200, 'Monthly trends retrieved', { trends });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/recent-activity
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const recentActivity = await dashboardService.getRecentActivity(limit);

    apiResponse.success(res, 200, 'Recent activity retrieved', { recentActivity });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
};
