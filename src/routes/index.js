// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const companyRoutes = require('./company.routes');
const pocRoutes = require('./poc.routes');
const jobPostingRoutes = require('./job-posting.routes');
const jobPostingStatusRoutes = require('./job-posting-status.routes');
const jobStatusRoutes = require('./job-status.routes');
const jobRoutes = require('./job.routes');
const candidateStageRoutes = require('./candidate-stage.routes');
const candidateRoutes = require('./candidate.routes');
const educationRoutes = require('./education.routes');
const filterRoutes = require('./filter.routes');
const jobPostingAssignmentRoutes = require('./job-posting-assignment.routes');
const entityRoutes = require('./entity.routes');
const rbacManagementRoutes = require('./rbac-management.routes');
const userReportingRoutes = require('./user-reporting.routes');

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/pocs', pocRoutes);
router.use('/job-postings', jobPostingRoutes);
router.use('/job-posting-statuses', jobPostingStatusRoutes);
router.use('/job-statuses', jobStatusRoutes);
router.use('/jobs', jobRoutes);
router.use('/candidate-stages', candidateStageRoutes);
router.use('/candidates', candidateRoutes);
router.use('/education', educationRoutes);
router.use('/filters', filterRoutes);
router.use('/job-posting-assignments', jobPostingAssignmentRoutes);
router.use('/entities', entityRoutes);
router.use('/rbac', rbacManagementRoutes);
router.use('/user-reporting', userReportingRoutes);
module.exports = router;