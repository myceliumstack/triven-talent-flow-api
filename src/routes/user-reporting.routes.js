const express = require('express');
const router = express.Router();
const UserReportingController = require('../controllers/user-reporting.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/user-reporting/:userId/direct-reportees
 * @desc Get direct reportees for a manager
 * @access Private
 */
router.get('/:userId/direct-reportees', UserReportingController.getDirectReportees);

/**
 * @route GET /api/user-reporting/:userId/all-reportees
 * @desc Get all reportees (direct + indirect) for a manager
 * @access Private
 */
router.get('/:userId/all-reportees', UserReportingController.getAllReportees);

/**
 * @route GET /api/user-reporting/:userId/manager
 * @desc Get manager for a user
 * @access Private
 */
router.get('/:userId/manager', UserReportingController.getManager);

/**
 * @route GET /api/user-reporting/:userId/hierarchy
 * @desc Get complete organizational hierarchy for a user
 * @access Private
 */
router.get('/:userId/hierarchy', UserReportingController.getOrganizationalHierarchy);

/**
 * @route POST /api/user-reporting/:userId/manager
 * @desc Assign a manager to a user
 * @access Private
 */
router.post('/:userId/manager', UserReportingController.assignManager);

/**
 * @route PATCH /api/user-reporting/:userId/manager
 * @desc Update user manager assignment
 * @access Private
 */
router.patch('/:userId/manager', UserReportingController.updateUserManager);

/**
 * @route PUT /api/user-reporting/:userId/manager
 * @desc Replace user manager assignment
 * @access Private
 */
router.put('/:userId/manager', UserReportingController.replaceUserManager);

module.exports = router;
