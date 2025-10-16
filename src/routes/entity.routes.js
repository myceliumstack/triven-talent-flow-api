// src/routes/entity.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

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
router.get('/', authenticateToken, getAllEntities);
router.get('/search', authenticateToken, searchEntities);
router.get('/type/:type', authenticateToken, getEntitiesByType);
router.get('/:id', authenticateToken, getEntityById);
router.post('/', authenticateToken, createEntity);
router.put('/:id', authenticateToken, updateEntity);
router.delete('/:id', authenticateToken, deleteEntity);

module.exports = router;
