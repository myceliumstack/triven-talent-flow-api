// src/routes/filter.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Import filter controllers
const { getAllBDMUsers, getBDMUsersByEntities } = require('../controllers/filter.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Filter routes are working' });
});

// BDM users route
router.get('/bdms', authenticateToken, getAllBDMUsers);

// BDM users by entities route
router.get('/bdms/by-entities', authenticateToken, getBDMUsersByEntities);

// Add your filter routes here one by one

module.exports = router;
