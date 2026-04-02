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

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List financial records (filtered, paginated)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, createdAt]
 *           default: date
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize('admin', 'analyst', 'viewer'),
  validate(listRecordsQuerySchema, 'query'),
  recordController.getRecords
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record retrieved successfully
 *       404:
 *         description: Record not found
 */
router.get(
  '/:id',
  authorize('admin', 'analyst', 'viewer'),
  validate(recordIdParamSchema, 'params'),
  recordController.getRecordById
);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: income
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-01"
 *               description:
 *                 type: string
 *                 example: March salary payment
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post(
  '/',
  authorize('admin'),
  validate(createRecordSchema),
  recordController.createRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Record not found
 */
router.put(
  '/:id',
  authorize('admin'),
  validate(recordIdParamSchema, 'params'),
  validate(updateRecordSchema),
  recordController.updateRecord
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft-delete a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Record not found
 */
router.delete(
  '/:id',
  authorize('admin'),
  validate(recordIdParamSchema, 'params'),
  recordController.deleteRecord
);

module.exports = router;
