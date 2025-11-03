const express = require('express');
const router = express.Router();
const JobCandidateAssignmentController = require('../controllers/job-candidate-assignment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Create job candidate assignment
router.post('/', JobCandidateAssignmentController.createJobCandidateAssignment);

// Get all job candidate assignments
router.get('/', JobCandidateAssignmentController.getAllJobCandidateAssignments);

// Get job candidate assignment by ID
router.get('/:id', JobCandidateAssignmentController.getJobCandidateAssignmentById);

// Update job candidate assignment
router.put('/:id', JobCandidateAssignmentController.updateJobCandidateAssignment);

// Update stageId for job candidate assignment (PATCH)
router.patch('/:id/stage', JobCandidateAssignmentController.updateStageId);

// Delete job candidate assignment
router.delete('/:id', JobCandidateAssignmentController.deleteJobCandidateAssignment);

module.exports = router;

