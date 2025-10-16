// src/routes/entity.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');

// Import entity controllers
const {
  getAllEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  searchEntities
} = require('../controllers/entity.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Entity routes are working' });
});

// Entity CRUD operations
router.get('/', authenticateToken, requirePermission('company.read'), getAllEntities);
router.get('/search', authenticateToken, requirePermission('company.read'), searchEntities);
router.get('/type/:type', authenticateToken, requirePermission('company.read'), getEntitiesByType);
router.get('/:id', authenticateToken, requirePermission('company.read'), getEntityById);
router.post('/', authenticateToken, requirePermission('company.create'), createEntity);
router.put('/:id', authenticateToken, requirePermission('company.update'), updateEntity);
router.delete('/:id', authenticateToken, requirePermission('company.delete'), deleteEntity);

module.exports = router;
