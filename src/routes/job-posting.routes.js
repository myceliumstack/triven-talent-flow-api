// src/routes/job-posting.routes.js
const express = require('express');
const router = express.Router();
const JobPostingController = require('../controllers/job-posting.controller');
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
router.get('/', JobPostingController.getJobPostings);

// GET /api/job-postings/search - Search job postings
router.get('/search', JobPostingController.searchJobPostings);

// GET /api/job-postings/stats - Get job posting statistics
router.get('/stats', JobPostingController.getJobPostingStats);

// GET /api/job-postings/category/:category - Get job postings by category
router.get('/category/:category', JobPostingController.getJobPostingsByCategory);

// GET /api/job-postings/status/:status - Get job postings by status
router.get('/status/:status', JobPostingController.getJobPostingsByStatus);

// GET /api/job-postings/validation/:validation - Get job postings by validation status
router.get('/validation/:validation', JobPostingController.getJobPostingsByValidation);

// GET /api/job-postings/:id - Get job posting by ID
router.get('/:id', JobPostingController.getJobPostingById);

// POST /api/job-postings - Create new job posting
router.post('/', 
  validateRequest(createJobPostingSchema), 
  JobPostingController.createJobPosting
);

// POST /api/job-postings/bulk - Bulk create job postings
router.post('/bulk', 
  validateRequest(bulkCreateJobPostingSchema), 
  JobPostingController.bulkCreateJobPostings
);

// PUT /api/job-postings/:id - Update job posting
router.put('/:id', 
  validateRequest(updateJobPostingSchema), 
  JobPostingController.updateJobPosting
);

// PATCH /api/job-postings/:id/validation - Update validation status
router.patch('/:id/validation', JobPostingController.updateJobPostingValidation);

// DELETE /api/job-postings/:id - Delete job posting
router.delete('/:id', JobPostingController.deleteJobPosting);

// DELETE /api/job-postings/bulk - Bulk delete job postings
router.delete('/bulk', 
  validateRequest(bulkDeleteJobPostingSchema), 
  JobPostingController.bulkDeleteJobPostings
);

// Test route (for development)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Job posting routes are working',
    user: req.user 
  });
});

module.exports = router;
