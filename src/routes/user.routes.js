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
  updateUserRole,
  replaceUserRoles,
  getUserRolesAndPermissions,
  getAllRolesWithPermissions,
  getAllPermissions,
  createRole,
  updateRole,
  deleteRole,
  getDepartments,
  getManagersByRole
} = require('../controllers/user.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working' });
});

// Current user profile routes (no admin permissions required)
router.get('/profile', authenticateToken, getCurrentUserProfile);
router.put('/profile', authenticateToken, updateCurrentUserProfile);

// User management routes
router.get('/departments', authenticateToken, getDepartments);
//API that fetches all managers for a given role ID based on hierarchy.
router.get('/managers/:roleId', authenticateToken, getManagersByRole);
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
router.patch('/:userId/roles/:roleId', authenticateToken, updateUserRole);
router.put('/:userId/roles', authenticateToken, replaceUserRoles);

// Role management routes
router.get('/roles/all', authenticateToken, getAllRolesWithPermissions);
router.get('/permissions/all', authenticateToken, getAllPermissions);
router.post('/roles', authenticateToken, createRole);
router.put('/roles/:roleId', authenticateToken, updateRole);
router.delete('/roles/:roleId', authenticateToken, deleteRole);

module.exports = router;