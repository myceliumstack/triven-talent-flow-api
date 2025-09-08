// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const companyRoutes = require('./company.routes');
const pocRoutes = require('./poc.routes');
const jobPostingRoutes = require('./job-posting.routes');

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/pocs', pocRoutes);
router.use('/job-postings', jobPostingRoutes);

module.exports = router;
