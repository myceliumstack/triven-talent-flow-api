// src/routes/company.routes.js
const express = require('express');
const router = express.Router();
const {
  getCompanies,
  searchCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  getCompaniesByIndustry,
  getCompaniesByAgreementStatus,
  getCompanyJobPostings,
  getCompanyPOCs
} = require('../controllers/company.controller');
const { validateRequest } = require('../utils/validation.utils');
const { 
  createCompanySchema, 
  updateCompanySchema 
} = require('../utils/validation.utils');
const { authenticateToken } = require('../middleware/auth.middleware');

// All company routes require authentication
router.use(authenticateToken);

// GET /api/companies - Get all companies with pagination and filters
router.get('/', getCompanies);

// GET /api/companies/search - Search companies
router.get('/search', searchCompanies);

// GET /api/companies/industry/:industry - Get companies by industry
router.get('/industry/:industry', getCompaniesByIndustry);

// GET /api/companies/agreement-status/:status - Get companies by agreement status
router.get('/agreement-status/:status', getCompaniesByAgreementStatus);

// GET /api/companies/:id - Get company by ID
router.get('/:id', getCompanyById);

// GET /api/companies/:id/stats - Get company statistics
router.get('/:id/stats', getCompanyStats);

// GET /api/companies/:id/job-postings - Get job postings for a specific company
router.get('/:id/job-postings', getCompanyJobPostings);

// GET /api/companies/:id/pocs - Get POCs for a specific company
router.get('/:id/pocs', getCompanyPOCs);

// POST /api/companies - Create new company
router.post('/', 
  validateRequest(createCompanySchema), 
  createCompany
);

// PUT /api/companies/:id - Update company
router.put('/:id', 
  validateRequest(updateCompanySchema), 
  updateCompany
);

// DELETE /api/companies/:id - Delete company
router.delete('/:id', deleteCompany);

// Test route (for development)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Company routes are working',
    user: req.user 
  });
});

module.exports = router;
