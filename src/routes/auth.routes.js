// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validateRequest } = require('../utils/validation.utils');
const { 
  registerUserSchema, 
  loginUserSchema, 
  changePasswordSchema 
} = require('../utils/validation.utils');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes (no authentication required)
router.post('/register', 
  validateRequest(registerUserSchema), 
  AuthController.register
);

router.post('/login', 
  validateRequest(loginUserSchema), 
  AuthController.login
);

// Protected routes (authentication required)
router.get('/profile', 
  authenticateToken, 
  AuthController.getProfile
);

router.post('/change-password', 
  authenticateToken, 
  validateRequest(changePasswordSchema), 
  AuthController.changePassword
);

router.post('/logout', 
  authenticateToken, 
  AuthController.logout
);

// Test route (for development)
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

module.exports = router;