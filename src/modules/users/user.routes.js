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

router.get(
  '/',
  validate(listUsersQuerySchema, 'query'),
  userController.getUsers
);

router.get(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.getUserById
);

router.patch(
  '/:id/role',
  validate(userIdParamSchema, 'params'),
  validate(updateRoleSchema),
  userController.updateUserRole
);

router.patch(
  '/:id/status',
  validate(userIdParamSchema, 'params'),
  validate(updateStatusSchema),
  userController.updateUserStatus
);

module.exports = router;
