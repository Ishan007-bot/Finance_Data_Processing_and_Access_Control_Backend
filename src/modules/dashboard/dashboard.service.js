const FinancialRecord = require('../../models/record.model');

/**
 * Get overall financial summary.
 * Returns total income, total expenses, and net balance.
 */
const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
        totalRecords: { $sum: 1 },
      },
    },
  ]);

  // If no records exist, return zeroed-out summary
  if (result.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      totalRecords: 0,
    };
  }

  const { totalIncome, totalExpenses, totalRecords } = result[0];

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalRecords,
  };
};

/**
 * Get totals grouped by category and type.
 * Useful for pie charts or category breakdowns.
 */
const getCategoryTotals = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);

  return result;
};

/**
 * Get monthly trends for the last 12 months.
 * Returns income and expense totals per month.
 */
const getMonthlyTrends = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const result = await FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        income: 1,
        expenses: 1,
        net: { $subtract: ['$income', '$expenses'] },
        count: 1,
      },
    },
  ]);

  return result;
};

/**
 * Get the most recent financial activity.
 * Returns the last N records sorted by date.
 */
const getRecentActivity = async (limit = 10) => {
  const records = await FinancialRecord.find({ isDeleted: false })
    .populate('createdBy', 'name email')
    .sort({ date: -1, createdAt: -1 })
    .limit(limit);

  return records;
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
};
