// src/routes/poc.routes.js
const express = require('express');
const router = express.Router();
const {
  getPOCs,
  getPOCsByCompanyId,
  searchPOCs,
  getPOCById,
  createPOC,
  updatePOC,
  deletePOC,
  getPOCsByDesignation,
  getPOCsByDepartment,
  getPOCStats,
  bulkCreatePOCs,
  bulkDeletePOCs
} = require('../controllers/poc.controller');
const { validateRequest } = require('../utils/validation.utils');
const { 
  createPOCSchema, 
  updatePOCSchema
} = require('../utils/validation.utils');
const { authenticateToken } = require('../middleware/auth.middleware');

// All POC routes require authentication
router.use(authenticateToken);

// GET /api/pocs - Get all POCs with pagination and filters
router.get('/', getPOCs);

// GET /api/pocs/search - Search POCs
router.get('/search', searchPOCs);

// GET /api/pocs/stats/:id - Get POC statistics
router.get('/stats/:id', getPOCStats);

// GET /api/pocs/designation/:designation - Get POCs by designation
router.get('/designation/:designation', getPOCsByDesignation);

// GET /api/pocs/department/:department - Get POCs by department
router.get('/department/:department', getPOCsByDepartment);

// GET /api/pocs/company/:companyId - Get POCs by company ID
router.get('/company/:companyId', getPOCsByCompanyId);

// GET /api/pocs/:id - Get POC by ID
router.get('/:id', getPOCById);

// POST /api/pocs - Create new POC
router.post('/', 
  validateRequest(createPOCSchema), 
  createPOC
);

// POST /api/pocs/bulk - Bulk create POCs
router.post('/bulk', bulkCreatePOCs);

// PUT /api/pocs/:id - Update POC
router.put('/:id', 
  validateRequest(updatePOCSchema), 
  updatePOC
);

// DELETE /api/pocs/:id - Delete POC
router.delete('/:id', deletePOC);

// DELETE /api/pocs/bulk - Bulk delete POCs
router.delete('/bulk', bulkDeletePOCs);

// Test route (for development)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'POC routes are working',
    user: req.user 
  });
});

module.exports = router;
