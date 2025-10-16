// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  searchUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRolesAndPermissions,
  getAllRolesWithPermissions,
  getAllPermissions,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/user.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working' });
});

// Current user profile routes (no admin permissions required)
router.get('/profile', authenticateToken, getCurrentUserProfile);
router.put('/profile', authenticateToken, updateCurrentUserProfile);

// User management routes
router.get('/', authenticateToken, getAllUsers);
router.get('/search', authenticateToken, searchUsers);
router.get('/stats', authenticateToken, getUserStats);
router.get('/:id/roles-permissions', authenticateToken, getUserRolesAndPermissions);
router.get('/:id', authenticateToken, getUserById);
router.post('/', authenticateToken, createUser);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);
router.patch('/:id/toggle-status', authenticateToken, toggleUserStatus);

// User role management routes
router.post('/:userId/roles', authenticateToken, assignRoleToUser);
router.delete('/:userId/roles/:roleId', authenticateToken, removeRoleFromUser);

// Role management routes
router.get('/roles/all', authenticateToken, getAllRolesWithPermissions);
router.get('/permissions/all', authenticateToken, getAllPermissions);
router.post('/roles', authenticateToken, createRole);
router.put('/roles/:roleId', authenticateToken, updateRole);
router.delete('/roles/:roleId', authenticateToken, deleteRole);

module.exports = router;