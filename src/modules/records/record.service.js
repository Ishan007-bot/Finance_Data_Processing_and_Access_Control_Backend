const FinancialRecord = require('../../models/record.model');
const ApiError = require('../../utils/apiError');

/**
 * Create a new financial record.
 */
const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({
    ...data,
    createdBy: userId,
  });

  return record;
};

/**
 * Get all records with filtering, sorting, and pagination.
 */
const getRecords = async ({
  page = 1,
  limit = 10,
  type,
  category,
  startDate,
  endDate,
  sortBy = 'date',
  sortOrder = 'desc',
}) => {
  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (category) {
    // Case-insensitive partial match for category
    filter.category = { $regex: category, $options: 'i' };
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      limit,
    },
  };
};

/**
 * Get a single record by ID.
 */
const getRecordById = async (recordId) => {
  const record = await FinancialRecord.findById(recordId)
    .populate('createdBy', 'name email');

  if (!record) {
    throw ApiError.notFound('Financial record not found');
  }

  return record;
};

/**
 * Update a financial record.
 * Only updates the fields that are provided.
 */
const updateRecord = async (recordId, updates) => {
  const record = await FinancialRecord.findById(recordId);

  if (!record) {
    throw ApiError.notFound('Financial record not found');
  }

  // Apply only the provided fields
  Object.keys(updates).forEach((key) => {
    record[key] = updates[key];
  });

  await record.save();

  // Re-populate the createdBy field for the response
  await record.populate('createdBy', 'name email');

  return record;
};

/**
 * Soft delete a financial record.
 * Sets isDeleted to true instead of removing from the database.
 */
const deleteRecord = async (recordId) => {
  const record = await FinancialRecord.findById(recordId);

  if (!record) {
    throw ApiError.notFound('Financial record not found');
  }

  record.isDeleted = true;
  await record.save();

  return record;
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
