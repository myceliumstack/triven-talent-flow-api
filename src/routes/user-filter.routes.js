// src/routes/user-filter.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { getSubordinates } = require('../controllers/user.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User filter routes are working' });
});

// API that fetches subordinates (direct reportees) for a given user ID
router.get('/:id/subordinates', authenticateToken, getSubordinates);

module.exports = router;
