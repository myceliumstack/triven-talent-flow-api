// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');
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

// User management routes (require admin permissions)
router.get('/', authenticateToken, requirePermission('user.read'), getAllUsers);
router.get('/search', authenticateToken, requirePermission('user.read'), searchUsers);
router.get('/stats', authenticateToken, requirePermission('user.read'), getUserStats);
router.get('/:id/roles-permissions', authenticateToken, requirePermission('user.read'), getUserRolesAndPermissions);
router.get('/:id', authenticateToken, requirePermission('user.read'), getUserById);
router.post('/', authenticateToken, requirePermission('user.create'), createUser);
router.put('/:id', authenticateToken, requirePermission('user.update'), updateUser);
router.delete('/:id', authenticateToken, requirePermission('user.delete'), deleteUser);
router.patch('/:id/toggle-status', authenticateToken, requirePermission('user.update'), toggleUserStatus);

// User role management routes
router.post('/:userId/roles', authenticateToken, requirePermission('role.manage'), assignRoleToUser);
router.delete('/:userId/roles/:roleId', authenticateToken, requirePermission('role.manage'), removeRoleFromUser);

// Role management routes
router.get('/roles/all', authenticateToken, requirePermission('role.read'), getAllRolesWithPermissions);
router.get('/permissions/all', authenticateToken, requirePermission('role.read'), getAllPermissions);
router.post('/roles', authenticateToken, requirePermission('role.create'), createRole);
router.put('/roles/:roleId', authenticateToken, requirePermission('role.update'), updateRole);
router.delete('/roles/:roleId', authenticateToken, requirePermission('role.delete'), deleteRole);

module.exports = router;