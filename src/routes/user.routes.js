// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Simple test route without RBAC for now
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working' });
});

// Basic protected route with just authentication
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ 
    message: 'User profile route working',
    user: req.user 
  });
});

module.exports = router;