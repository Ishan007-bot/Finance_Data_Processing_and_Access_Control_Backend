const recordService = require('./record.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * POST /api/records
 */
const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);

    apiResponse.success(res, 201, 'Financial record created successfully', { record });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/records
 */
const getRecords = async (req, res, next) => {
  try {
    const { records, pagination } = await recordService.getRecords(req.query);

    apiResponse.paginated(res, 'Records retrieved successfully', records, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/records/:id
 */
const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);

    apiResponse.success(res, 200, 'Record retrieved successfully', { record });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/records/:id
 */
const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);

    apiResponse.success(res, 200, 'Record updated successfully', { record });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/records/:id
 */
const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);

    apiResponse.success(res, 200, 'Record deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
