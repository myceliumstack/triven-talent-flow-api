// src/controllers/job-posting-assignment.controller.js
const JobPostingAssignmentService = require('../services/job-posting-assignment.service');

/**
 * Get all job posting assignments with filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobPostingAssignments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      assignedUserId,
      search,
      jobTitle,
      company,
      category,
      location,
      status,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = req.query;

    // Helper function to parse comma-separated values into array
    const parseFilterValue = (value) => {
      if (!value) return null;
      if (Array.isArray(value)) {
        // Handle array format: ?jobTitle[]=dev&jobTitle[]=eng
        return value.map(v => v.trim()).filter(v => v.length > 0);
      }
      // Handle comma-separated format: ?jobTitle=dev,eng
      return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    };

    // Build filters object
    const filters = {};
    
    if (assignedUserId) filters.assignedUserId = assignedUserId;
    
    // Search filter
    if (search) filters.search = search;
    
    // Specific field searches - support multiple values
    const jobTitleValues = parseFilterValue(jobTitle);
    if (jobTitleValues && jobTitleValues.length > 0) {
      filters.jobTitle = jobTitleValues.length === 1 ? jobTitleValues[0] : jobTitleValues;
    }
    
    const companyValues = parseFilterValue(company);
    if (companyValues && companyValues.length > 0) {
      filters.company = companyValues.length === 1 ? companyValues[0] : companyValues;
    }
    
    const categoryValues = parseFilterValue(category);
    if (categoryValues && categoryValues.length > 0) {
      filters.category = categoryValues.length === 1 ? categoryValues[0] : categoryValues;
    }
    
    const locationValues = parseFilterValue(location);
    if (locationValues && locationValues.length > 0) {
      filters.location = locationValues.length === 1 ? locationValues[0] : locationValues;
    }
    
    const statusValues = parseFilterValue(status);
    if (statusValues && statusValues.length > 0) {
      filters.status = statusValues.length === 1 ? statusValues[0] : statusValues;
    }

    const result = await JobPostingAssignmentService.getJobPostingAssignments({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      message: 'Job posting assignments retrieved successfully',
      data: result.assignments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting job posting assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job posting assignments',
      error: error.message
    });
  }
};

/**
 * Create a single job posting assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createJobPostingAssignment = async (req, res) => {
  try {
    const {
      jobPostingId,
      entityId,
      assignedUserId,
      statusId,
      priority = 'normal',
      notes
    } = req.body;

    const assignedById = req.user.userId; // Get from authenticated user

    // Validate required fields
    if (!jobPostingId || !entityId || !statusId) {
      return res.status(400).json({
        success: false,
        message: 'jobPostingId, entityId, and statusId are required'
      });
    }

    const assignment = await JobPostingAssignmentService.createJobPostingAssignment(
      jobPostingId,
      entityId,
      assignedById,
      assignedUserId,
      statusId,
      priority,
      notes
    );

    res.status(201).json({
      success: true,
      message: 'Job posting assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating job posting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job posting assignment',
      error: error.message
    });
  }
};

/**
 * Update a job posting assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateJobPostingAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const modifiedById = req.user.userId;

    const assignment = await JobPostingAssignmentService.updateJobPostingAssignment(
      id,
      updateData,
      modifiedById
    );

    res.json({
      success: true,
      message: 'Job posting assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error updating job posting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job posting assignment',
      error: error.message
    });
  }
};

/**
 * Update assigned user for a job posting assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAssignedUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedUserId } = req.body;
    const modifiedById = req.user.userId;

    if (!assignedUserId) {
      return res.status(400).json({
        success: false,
        message: 'assignedUserId is required'
      });
    }

    const assignment = await JobPostingAssignmentService.updateJobPostingAssignment(
      id,
      { assignedUserId },
      modifiedById
    );

    res.json({
      success: true,
      message: 'Assigned user updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error updating assigned user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assigned user',
      error: error.message
    });
  }
};

/**
 * Delete a job posting assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteJobPostingAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    await JobPostingAssignmentService.deleteJobPostingAssignment(id);

    res.json({
      success: true,
      message: 'Job posting assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job posting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job posting assignment',
      error: error.message
    });
  }
};

/**
 * Bulk assign job postings to entities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkAssignJobPostingsToEntities = async (req, res) => {
  try {
    const {
      jobPostingIds,
      entityIds,
      assignedUserId,
      statusId,
      priority = 'normal',
      notes
    } = req.body;

    const assignedById = req.user.userId;

    // Comprehensive validation
    const errors = [];
    
    if (!jobPostingIds || !Array.isArray(jobPostingIds) || jobPostingIds.length === 0) {
      errors.push('jobPostingIds must be a non-empty array');
    }
    
    if (!entityIds || !Array.isArray(entityIds) || entityIds.length === 0) {
      errors.push('entityIds must be a non-empty array');
    }
    
    if (!assignedUserId || typeof assignedUserId !== 'string') {
      errors.push('assignedUserId is required and must be a string');
    }
    
    if (!statusId || typeof statusId !== 'string') {
      errors.push('statusId is required and must be a string');
    }
    
    if (priority && !['high', 'normal', 'low'].includes(priority)) {
      errors.push('priority must be one of: high, normal, low');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    const result = await JobPostingAssignmentService.bulkAssignJobPostingsToEntities(
      jobPostingIds,
      entityIds,
      assignedById,
      assignedUserId,
      statusId,
      priority,
      notes
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error bulk assigning job postings:', error);
    
    // Handle specific error types
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Assignment already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk assignment',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get entities for assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntitiesForAssignment = async (req, res) => {
  try {
    const entities = await JobPostingAssignmentService.getEntitiesForAssignment();
    res.json({
      success: true,
      message: 'Entities retrieved successfully',
      data: entities
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entities',
      error: error.message
    });
  }
};

/**
 * Get job posting statuses for assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobPostingStatusesForAssignment = async (req, res) => {
  try {
    const statuses = await JobPostingAssignmentService.getJobPostingStatusesForAssignment();
    res.json({
      success: true,
      message: 'Job posting statuses retrieved successfully',
      data: statuses
    });
  } catch (error) {
    console.error('Error fetching job posting statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job posting statuses',
      error: error.message
    });
  }
};

/**
 * Get assignment status for job postings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobPostingAssignmentStatus = async (req, res) => {
  try {
    const { jobPostingIds } = req.body;

    // Validate input
    if (!jobPostingIds || !Array.isArray(jobPostingIds) || jobPostingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'jobPostingIds array is required and must not be empty'
      });
    }

    const status = await JobPostingAssignmentService.getJobPostingAssignmentStatus(jobPostingIds);

    res.json({
      success: true,
      message: 'Assignment status retrieved successfully',
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching assignment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get job posting assignments by status ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobPostingAssignmentsByStatus = async (req, res) => {
  try {
    const { statusId, userId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = req.query;

    if (!statusId) {
      return res.status(400).json({
        success: false,
        message: 'Status ID is required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await JobPostingAssignmentService.getJobPostingAssignmentsByStatus(
      statusId,
      userId,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      }
    );

    res.json({
      success: true,
      message: 'Job posting assignments retrieved successfully',
      data: result.assignments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting job posting assignments by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job posting assignments by status',
      error: error.message
    });
  }
};

/**
 * Search job posting assignments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchJobPostingAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { q: query } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const assignments = await JobPostingAssignmentService.searchJobPostingAssignments(query, userId);

    res.json({
      success: true,
      message: 'Job posting assignments search completed',
      data: assignments
    });
  } catch (error) {
    console.error('Error searching job posting assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search job posting assignments',
      error: error.message
    });
  }
};

module.exports = {
  getJobPostingAssignments,
  createJobPostingAssignment,
  updateJobPostingAssignment,
  updateAssignedUser,
  deleteJobPostingAssignment,
  bulkAssignJobPostingsToEntities,
  getEntitiesForAssignment,
  getJobPostingStatusesForAssignment,
  getJobPostingAssignmentStatus,
  getJobPostingAssignmentsByStatus,
  searchJobPostingAssignments
};
