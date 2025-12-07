// src/routes/job-posting.routes.js
const express = require('express');
const router = express.Router();
const {
  getJobPostings,
  searchJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobPostingsByCompanyId,
  getJobPostingsByCreatedBy,
  getJobPostingsByCategory,
  getJobPostingsByStatus,
  getJobPostingsByValidation,
  updateJobPostingValidation,
  getJobPostingStats,
  assignBDMToJobPosting,
  getJobPostingsByExperience,
  getAllCompanies,
  bulkValidateJobPostings,
  bulkUnvalidateJobPostings,
  bulkRejectJobPostings,
  bulkAssignJobPostingsToEntities
} = require('../controllers/job-posting.controller');
const { validateRequest } = require('../utils/validation.utils');
const { 
  createJobPostingSchema, 
  updateJobPostingSchema,
  bulkCreateJobPostingSchema,
  bulkDeleteJobPostingSchema
} = require('../utils/validation.utils');
const { authenticateToken } = require('../middleware/auth.middleware');

// All job posting routes require authentication
router.use(authenticateToken);

// GET /api/job-postings - Get all job postings with pagination and filters
router.get('/', getJobPostings);

// GET /api/job-postings/companies - Get all companies (helper endpoint)
router.get('/companies', getAllCompanies);

// GET /api/job-postings/search - Search job postings
router.get('/search', searchJobPostings);

// GET /api/job-postings/stats - Get job posting statistics (Note: this may need specific ID)
router.get('/stats/:id', getJobPostingStats);

// GET /api/job-postings/category/:category - Get job postings by category
router.get('/category/:category', getJobPostingsByCategory);

// GET /api/job-postings/status/:status - Get job postings by status
router.get('/status/:status', getJobPostingsByStatus);

// GET /api/job-postings/validation/:validation - Get job postings by validation status
router.get('/validation/:validation', getJobPostingsByValidation);

// GET /api/job-postings/experience/:experience - Get job postings by experience
router.get('/experience/:experience', getJobPostingsByExperience);

// GET /api/job-postings/company/:companyId - Get job postings by company ID
router.get('/company/:companyId', getJobPostingsByCompanyId);

// GET /api/job-postings/created-by/:userId - Get job postings by created by user ID
router.get('/created-by/:userId', getJobPostingsByCreatedBy);

// GET /api/job-postings/:id - Get job posting by ID
router.get('/:id', getJobPostingById);

// POST /api/job-postings - Create new job posting
router.post('/', 
  validateRequest(createJobPostingSchema), 
  createJobPosting
);

// PUT /api/job-postings/:id - Update job posting
router.put('/:id', 
  validateRequest(updateJobPostingSchema), 
  updateJobPosting
);

// PATCH /api/job-postings/:id/validation - Update validation status
router.patch('/:id/validation', updateJobPostingValidation);

// PATCH /api/job-postings/:id/assign-bdm - Assign BDM to job posting
router.patch('/:id/assign-bdm', assignBDMToJobPosting);

// POST /api/job-postings/bulk-validate - Bulk validate multiple job postings
router.post('/bulk-validate', bulkValidateJobPostings);

// POST /api/job-postings/bulk-unvalidate - Bulk unvalidate multiple job postings
router.post('/bulk-unvalidate', bulkUnvalidateJobPostings);

// POST /api/job-postings/bulk-reject - Bulk reject multiple job postings
router.post('/bulk-reject', bulkRejectJobPostings);

// POST /api/job-postings/bulk-assign - Bulk assign job postings to entities
router.post('/bulk-assign', bulkAssignJobPostingsToEntities);

// DELETE /api/job-postings/:id - Delete job posting
router.delete('/:id', deleteJobPosting);

// Test route (for development)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Job posting routes are working',
    user: req.user 
  });
});

module.exports = router;
