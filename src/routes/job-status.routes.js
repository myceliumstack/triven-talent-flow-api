const express = require('express');
const router = express.Router();
const JobStatusController = require('../controllers/job-status.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All job status routes require authentication
router.use(authenticateToken);

// Create job status
router.post('/', JobStatusController.createJobStatus);

// Get all job statuses
router.get('/', JobStatusController.getAllJobStatuses);

// Get job status by ID
router.get('/:id', JobStatusController.getJobStatusById);

// Update job status
router.put('/:id', JobStatusController.updateJobStatus);

// Delete job status
router.delete('/:id', JobStatusController.deleteJobStatus);

module.exports = router;
