// src/routes/rbac-management.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Import RBAC management controllers
const {
  // Permission CRUD
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  
  // Role CRUD
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  
  // Role-Permission management
  assignPermissionToRole,
  removePermissionFromRole
} = require('../controllers/rbac-management.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'RBAC Management routes are working' });
});

// ================================================================
// PERMISSION ROUTES
// ================================================================

// Permission CRUD operations
router.get('/permissions', authenticateToken, getAllPermissions);
router.get('/permissions/:id', authenticateToken, getPermissionById);
router.post('/permissions', authenticateToken, createPermission);
router.put('/permissions/:id', authenticateToken, updatePermission);
router.delete('/permissions/:id', authenticateToken, deletePermission);

// ================================================================
// ROLE ROUTES
// ================================================================

// Role CRUD operations
router.get('/roles', authenticateToken, getAllRoles);
router.get('/roles/:id', authenticateToken, getRoleById);
router.post('/roles', authenticateToken, createRole);
router.put('/roles/:id', authenticateToken, updateRole);
router.delete('/roles/:id', authenticateToken, deleteRole);

// ================================================================
// ROLE-PERMISSION MANAGEMENT ROUTES
// ================================================================

// Role-Permission assignment operations
router.post('/role-permissions/assign', authenticateToken, assignPermissionToRole);
router.delete('/role-permissions/remove', authenticateToken, removePermissionFromRole);

module.exports = router;
