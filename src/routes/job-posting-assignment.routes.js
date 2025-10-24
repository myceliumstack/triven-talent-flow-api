// src/routes/job-posting-assignment.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/rbac.middleware');

// Import assignment controllers
const {
  getJobPostingAssignments,
  createJobPostingAssignment,
  updateJobPostingAssignment,
  deleteJobPostingAssignment,
  bulkAssignJobPostingsToEntities,
  getEntitiesForAssignment,
  getJobPostingStatusesForAssignment,
  getJobPostingAssignmentStatus,
  updateAssignedUser,
  getJobPostingAssignmentsByStatus,
  searchJobPostingAssignments
} = require('../controllers/job-posting-assignment.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Job posting assignment routes are working' });
});

// Assignment CRUD operations
router.get('/', authenticateToken, getJobPostingAssignments);
router.get('/search/user/:userId', authenticateToken, searchJobPostingAssignments);
router.get('/status/:statusId/user/:userId', authenticateToken, getJobPostingAssignmentsByStatus);
router.post('/', authenticateToken, createJobPostingAssignment);
router.put('/:id', authenticateToken, updateJobPostingAssignment);
router.delete('/:id', authenticateToken, deleteJobPostingAssignment);

// Bulk operations
router.post('/bulk-assign', authenticateToken, bulkAssignJobPostingsToEntities);

// Helper routes for assignment forms
router.get('/entities', authenticateToken, getEntitiesForAssignment);
router.get('/statuses', authenticateToken, getJobPostingStatusesForAssignment);

// Assignment status route
router.post('/status', authenticateToken, getJobPostingAssignmentStatus);

// Update assigned user route
router.patch('/:id/assign-user', authenticateToken, updateAssignedUser);

module.exports = router;
