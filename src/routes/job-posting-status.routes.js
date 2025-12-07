// src/routes/job-posting-status.routes.js
const express = require('express');
const router = express.Router();

// Import validation schemas
const {
  createJobPostingStatusSchema,
  updateJobPostingStatusSchema,
  validateRequest
} = require('../utils/validation.utils');

// Import middleware
const { authenticateToken } = require('../middleware/auth.middleware');

// Import controller functions
const {
  getStatuses,
  getStatusById,
  getStatusByName,
  createStatus,
  updateStatus,
  deleteStatus,
  toggleStatus,
  getStatusStats,
  searchStatuses,
  getStatusesByContext
} = require('../controllers/job-posting-status.controller');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/job-posting-statuses - Get all statuses with pagination and filters
router.get('/', getStatuses);

// GET /api/job-posting-statuses/search - Search statuses
router.get('/search', searchStatuses);

// GET /api/job-posting-statuses/context/:context - Get statuses by context (RA, validation, or followup)
router.get('/context/:context', getStatusesByContext);

// GET /api/job-posting-statuses/stats - Get status statistics
router.get('/stats', getStatusStats);

// GET /api/job-posting-statuses/:id - Get status by ID
router.get('/:id', getStatusById);

// GET /api/job-posting-statuses/name/:name - Get status by name
router.get('/name/:name', getStatusByName);

// POST /api/job-posting-statuses - Create new status
router.post('/', validateRequest(createJobPostingStatusSchema), createStatus);

// PUT /api/job-posting-statuses/:id - Update status
router.put('/:id', validateRequest(updateJobPostingStatusSchema), updateStatus);

// PATCH /api/job-posting-statuses/:id/toggle - Toggle status active/inactive
router.patch('/:id/toggle', toggleStatus);

// DELETE /api/job-posting-statuses/:id - Delete status
router.delete('/:id', deleteStatus);

module.exports = router;
