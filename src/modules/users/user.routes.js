const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const {
  updateRoleSchema,
  updateStatusSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} = require('./user.validation');

const router = express.Router();

// All user management routes require admin access
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (paginated)
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, analyst, viewer]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get(
  '/',
  validate(listUsersQuerySchema, 'query'),
  userController.getUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     tags: [Users]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Cannot change own role
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/role',
  validate(userIdParamSchema, 'params'),
  validate(updateRoleSchema),
  userController.updateUserRole
);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user
 *     tags: [Users]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Cannot change own status
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/status',
  validate(userIdParamSchema, 'params'),
  validate(updateStatusSchema),
  userController.updateUserStatus
);

module.exports = router;
