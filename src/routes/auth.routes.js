// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  changePassword, 
  logout 
} = require('../controllers/auth.controller');
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
  register
);

router.post('/login', 
  validateRequest(loginUserSchema), 
  login
);

// Protected routes (authentication required)
router.get('/profile', 
  authenticateToken, 
  getProfile
);

router.post('/change-password', 
  authenticateToken, 
  validateRequest(changePasswordSchema), 
  changePassword
);

router.post('/logout', 
  authenticateToken, 
  logout
);

// Test route (for development)
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

module.exports = router;