const express = require('express');
const router = express.Router();
const JobController = require('../controllers/job.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All job routes require authentication
router.use(authenticateToken);

// Create job
router.post('/', JobController.createJob);

// Get all jobs
router.get('/', JobController.getAllJobs);

// Get job by job code
router.get('/code/:jobCode', JobController.getJobByCode);

// Get job by ID
router.get('/:id', JobController.getJobById);

// Update job
router.put('/:id', JobController.updateJob);

// Delete job
router.delete('/:id', JobController.deleteJob);

module.exports = router;
