// src/routes/user-filter.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Import filter controllers (to be created)
const {
  getUsersWithFilters,
  getFilterOptions,
  getUsersByCriteria,
  getUsersByRole,
  getUsersByEntity,
  getUsersByPermission,
  getUsersByDateRange,
  getUsersByStatus,
  getUsersBySearch,
  getUsersByMultipleCriteria,
  exportFilteredUsers,
  getFilterStats
} = require('../controllers/user-filter.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User filter routes are working' });
});

// Basic filtering routes
router.get('/filters', authenticateToken, getUsersWithFilters);
router.get('/options', authenticateToken, getFilterOptions);
router.post('/criteria', authenticateToken, getUsersByCriteria);

// Specific filter routes
router.get('/by-role/:roleId', authenticateToken, getUsersByRole);
router.get('/by-entity/:entityId', authenticateToken, getUsersByEntity);
router.get('/by-permission/:permission', authenticateToken, getUsersByPermission);
router.get('/by-date-range', authenticateToken, getUsersByDateRange);
router.get('/by-status/:status', authenticateToken, getUsersByStatus);
router.get('/search', authenticateToken, getUsersBySearch);

// Advanced filtering routes
router.post('/multiple-criteria', authenticateToken, getUsersByMultipleCriteria);
router.post('/export', authenticateToken, exportFilteredUsers);
router.get('/stats', authenticateToken, getFilterStats);

module.exports = router;
