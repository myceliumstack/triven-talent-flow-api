// src/routes/rbac-management.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');

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
router.get('/permissions', authenticateToken, requirePermission('role.read'), getAllPermissions);
router.get('/permissions/:id', authenticateToken, requirePermission('role.read'), getPermissionById);
router.post('/permissions', authenticateToken, requirePermission('role.create'), createPermission);
router.put('/permissions/:id', authenticateToken, requirePermission('role.update'), updatePermission);
router.delete('/permissions/:id', authenticateToken, requirePermission('role.delete'), deletePermission);

// ================================================================
// ROLE ROUTES
// ================================================================

// Role CRUD operations
router.get('/roles', authenticateToken, requirePermission('role.read'), getAllRoles);
router.get('/roles/:id', authenticateToken, requirePermission('role.read'), getRoleById);
router.post('/roles', authenticateToken, requirePermission('role.create'), createRole);
router.put('/roles/:id', authenticateToken, requirePermission('role.update'), updateRole);
router.delete('/roles/:id', authenticateToken, requirePermission('role.delete'), deleteRole);

// ================================================================
// ROLE-PERMISSION MANAGEMENT ROUTES
// ================================================================

// Role-Permission assignment operations
router.post('/role-permissions/assign', authenticateToken, requirePermission('role.manage'), assignPermissionToRole);
router.delete('/role-permissions/remove', authenticateToken, requirePermission('role.manage'), removePermissionFromRole);

module.exports = router;
