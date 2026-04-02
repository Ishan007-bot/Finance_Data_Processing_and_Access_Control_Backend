const express = require('express');
const recordController = require('./record.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  listRecordsQuerySchema,
} = require('./record.validation');

const router = express.Router();

// All record routes require authentication
router.use(authenticate);

// GET routes — accessible by admin, analyst, and viewer
router.get(
  '/',
  authorize('admin', 'analyst', 'viewer'),
  validate(listRecordsQuerySchema, 'query'),
  recordController.getRecords
);

router.get(
  '/:id',
  authorize('admin', 'analyst', 'viewer'),
  validate(recordIdParamSchema, 'params'),
  recordController.getRecordById
);

// Write routes — admin only
router.post(
  '/',
  authorize('admin'),
  validate(createRecordSchema),
  recordController.createRecord
);

router.put(
  '/:id',
  authorize('admin'),
  validate(recordIdParamSchema, 'params'),
  validate(updateRecordSchema),
  recordController.updateRecord
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(recordIdParamSchema, 'params'),
  recordController.deleteRecord
);

module.exports = router;
