const express = require('express');
const router = express.Router();
const EducationController = require('../controllers/education.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All education routes require authentication
router.use(authenticateToken);

// Create education
router.post('/', EducationController.createEducation);

// Get all educations
router.get('/', EducationController.getAllEducations);

// Get education by ID
router.get('/:id', EducationController.getEducationById);

// Update education
router.put('/:id', EducationController.updateEducation);

// Delete education
router.delete('/:id', EducationController.deleteEducation);

module.exports = router;
