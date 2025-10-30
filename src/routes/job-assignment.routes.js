const express = require('express');
const router = express.Router();
const jobAssignmentController = require('../controllers/job-assignment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Create a new job assignment
router.post('/', authenticateToken, jobAssignmentController.createJobAssignment);

// Get all job assignments with pagination and filters
router.get('/', authenticateToken, jobAssignmentController.getAllJobAssignments);

// Get job assignment by ID
router.get('/:id', authenticateToken, jobAssignmentController.getJobAssignmentById);

// Update job assignment
router.put('/:id', authenticateToken, jobAssignmentController.updateJobAssignment);

// Delete job assignment
router.delete('/:id', authenticateToken, jobAssignmentController.deleteJobAssignment);

// Get job assignments by job ID
router.get('/job/:jobId', authenticateToken, jobAssignmentController.getJobAssignmentsByJobId);

// Get job assignments by user ID
router.get('/user/:userId', authenticateToken, jobAssignmentController.getJobAssignmentsByUserId);

module.exports = router;
