// src/routes/resume.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  uploadResume,
  getResume,
  deleteResume,
  checkResume,
  upload
} = require('../controllers/resume.controller');

// All resume routes require authentication
router.use(authenticateToken);

// POST /api/resumes/:candidateId/upload - Upload resume for a candidate
router.post('/:candidateId/upload', upload.single('resume'), uploadResume);

// GET /api/resumes/:candidateId - Get resume for a candidate
router.get('/:candidateId', getResume);

// DELETE /api/resumes/:candidateId - Delete resume for a candidate
router.delete('/:candidateId', deleteResume);

// GET /api/resumes/:candidateId/check - Check if candidate has a resume
router.get('/:candidateId/check', checkResume);

module.exports = router;

