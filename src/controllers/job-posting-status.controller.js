// src/controllers/job-posting-status.controller.js
const JobPostingStatusService = require('../services/job-posting-status.service');

/**
 * Get all job posting statuses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatuses = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      search: req.query.search,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      sortBy: req.query.sortBy || 'name',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const result = await JobPostingStatusService.getAllStatuses(options);

    res.status(200).json({
      success: true,
      message: 'Job posting statuses retrieved successfully',
      data: result.statuses,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting job posting statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get job posting status by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await JobPostingStatusService.getStatusById(id);

    res.status(200).json({
      success: true,
      message: 'Job posting status retrieved successfully',
      data: status
    });
  } catch (error) {
    console.error('Error getting job posting status:', error);
    
    if (error.message === 'Job posting status not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get job posting status by name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatusByName = async (req, res) => {
  try {
    const { name } = req.params;
    const status = await JobPostingStatusService.getStatusByName(name);

    res.status(200).json({
      success: true,
      message: 'Job posting status retrieved successfully',
      data: status
    });
  } catch (error) {
    console.error('Error getting job posting status by name:', error);
    
    if (error.message === 'Job posting status not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new job posting status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStatus = async (req, res) => {
  try {
    const statusData = req.validatedData;
    const status = await JobPostingStatusService.createStatus(statusData);

    res.status(201).json({
      success: true,
      message: 'Job posting status created successfully',
      data: status
    });
  } catch (error) {
    console.error('Error creating job posting status:', error);
    
    if (error.message === 'Status with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update job posting status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;
    const status = await JobPostingStatusService.updateStatus(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Job posting status updated successfully',
      data: status
    });
  } catch (error) {
    console.error('Error updating job posting status:', error);
    
    if (error.message === 'Job posting status not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Status with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete job posting status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await JobPostingStatusService.deleteStatus(id);

    res.status(200).json({
      success: true,
      message: 'Job posting status deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job posting status:', error);
    
    if (error.message === 'Job posting status not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Cannot delete status that is being used by job postings') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Toggle status active/inactive
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await JobPostingStatusService.toggleStatus(id);

    res.status(200).json({
      success: true,
      message: `Status ${status.isActive ? 'activated' : 'deactivated'} successfully`,
      data: status
    });
  } catch (error) {
    console.error('Error toggling job posting status:', error);
    
    if (error.message === 'Job posting status not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get status statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatusStats = async (req, res) => {
  try {
    const stats = await JobPostingStatusService.getStatusStats();

    res.status(200).json({
      success: true,
      message: 'Status statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting status statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Search statuses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchStatuses = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const statuses = await JobPostingStatusService.searchStatuses(q);

    res.status(200).json({
      success: true,
      message: 'Status search completed successfully',
      data: statuses
    });
  } catch (error) {
    console.error('Error searching statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getStatuses,
  getStatusById,
  getStatusByName,
  createStatus,
  updateStatus,
  deleteStatus,
  toggleStatus,
  getStatusStats,
  searchStatuses
};
