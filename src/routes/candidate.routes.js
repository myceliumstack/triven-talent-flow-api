const express = require('express');
const router = express.Router();
const CandidateController = require('../controllers/candidate.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All candidate routes require authentication
router.use(authenticateToken);

// Create candidate
router.post('/', CandidateController.createCandidate);

// Get all candidates
router.get('/', CandidateController.getAllCandidates);

// Get candidates by job code
router.get('/jobs/:jobCode', CandidateController.getCandidatesByJobCode);

// Get candidate by ID
router.get('/:id', CandidateController.getCandidateById);

// Update candidate
router.put('/:id', CandidateController.updateCandidate);

// Delete candidate
router.delete('/:id', CandidateController.deleteCandidate);

module.exports = router;
