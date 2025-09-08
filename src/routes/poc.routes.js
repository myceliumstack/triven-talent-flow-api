// src/routes/poc.routes.js
const express = require('express');
const router = express.Router();
const POCController = require('../controllers/poc.controller');
const { validateRequest } = require('../utils/validation.utils');
const { 
  createPOCSchema, 
  updatePOCSchema
} = require('../utils/validation.utils');
const { authenticateToken } = require('../middleware/auth.middleware');

// All POC routes require authentication
router.use(authenticateToken);

// GET /api/pocs - Get all POCs with pagination and filters
router.get('/', POCController.getPOCs);

// GET /api/pocs/search - Search POCs
router.get('/search', POCController.searchPOCs);

// GET /api/pocs/stats - Get POC statistics
router.get('/stats', POCController.getPOCStats);

// GET /api/pocs/designation/:designation - Get POCs by designation
router.get('/designation/:designation', POCController.getPOCsByDesignation);

// GET /api/pocs/department/:department - Get POCs by department
router.get('/department/:department', POCController.getPOCsByDepartment);

// GET /api/pocs/:id - Get POC by ID
router.get('/:id', POCController.getPOCById);

// POST /api/pocs - Create new POC
router.post('/', 
  validateRequest(createPOCSchema), 
  POCController.createPOC
);

// PUT /api/pocs/:id - Update POC
router.put('/:id', 
  validateRequest(updatePOCSchema), 
  POCController.updatePOC
);

// DELETE /api/pocs/:id - Delete POC
router.delete('/:id', POCController.deletePOC);

// Test route (for development)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'POC routes are working',
    user: req.user 
  });
});

module.exports = router;
