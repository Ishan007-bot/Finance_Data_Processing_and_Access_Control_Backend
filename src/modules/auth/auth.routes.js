const express = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
