const express = require('express');
const router = express.Router();
const CandidateStageController = require('../controllers/candidate-stage.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All candidate stage routes require authentication
router.use(authenticateToken);

// Create candidate stage
router.post('/', CandidateStageController.createCandidateStage);

// Get all candidate stages
router.get('/', CandidateStageController.getAllCandidateStages);

// Get candidate stage by ID
router.get('/:id', CandidateStageController.getCandidateStageById);

// Update candidate stage
router.put('/:id', CandidateStageController.updateCandidateStage);

// Delete candidate stage
router.delete('/:id', CandidateStageController.deleteCandidateStage);

module.exports = router;
