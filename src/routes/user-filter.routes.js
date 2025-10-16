// src/routes/user-filter.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');

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
router.get('/filters', authenticateToken, requirePermission('user.read'), getUsersWithFilters);
router.get('/options', authenticateToken, requirePermission('user.read'), getFilterOptions);
router.post('/criteria', authenticateToken, requirePermission('user.read'), getUsersByCriteria);

// Specific filter routes
router.get('/by-role/:roleId', authenticateToken, requirePermission('user.read'), getUsersByRole);
router.get('/by-entity/:entityId', authenticateToken, requirePermission('user.read'), getUsersByEntity);
router.get('/by-permission/:permission', authenticateToken, requirePermission('user.read'), getUsersByPermission);
router.get('/by-date-range', authenticateToken, requirePermission('user.read'), getUsersByDateRange);
router.get('/by-status/:status', authenticateToken, requirePermission('user.read'), getUsersByStatus);
router.get('/search', authenticateToken, requirePermission('user.read'), getUsersBySearch);

// Advanced filtering routes
router.post('/multiple-criteria', authenticateToken, requirePermission('user.read'), getUsersByMultipleCriteria);
router.post('/export', authenticateToken, requirePermission('user.read'), exportFilteredUsers);
router.get('/stats', authenticateToken, requirePermission('user.read'), getFilterStats);

module.exports = router;
