const UserReportingService = require('../services/user-reporting.service');

/**
 * Get direct reportees for a manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDirectReportees = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reportees = await UserReportingService.getDirectReportees(userId);
    
    res.json({
      success: true,
      message: 'Direct reportees retrieved successfully',
      data: reportees,
      count: reportees.length
    });
  } catch (error) {
    console.error('Error getting direct reportees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get direct reportees',
      error: error.message
    });
  }
};

/**
 * Get all reportees (direct + indirect) for a manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReportees = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reportees = await UserReportingService.getAllReportees(userId);
    
    res.json({
      success: true,
      message: 'All reportees retrieved successfully',
      data: reportees,
      count: reportees.length
    });
  } catch (error) {
    console.error('Error getting all reportees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all reportees',
      error: error.message
    });
  }
};

/**
 * Get manager for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getManager = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const manager = await UserReportingService.getManager(userId);
    
    if (!manager) {
      return res.json({
        success: true,
        message: 'No manager found for this user',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Manager retrieved successfully',
      data: manager
    });
  } catch (error) {
    console.error('Error getting manager:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get manager',
      error: error.message
    });
  }
};

/**
 * Get complete organizational hierarchy for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOrganizationalHierarchy = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const hierarchy = await UserReportingService.getOrganizationalHierarchy(userId);
    
    res.json({
      success: true,
      message: 'Organizational hierarchy retrieved successfully',
      data: hierarchy
    });
  } catch (error) {
    console.error('Error getting organizational hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organizational hierarchy',
      error: error.message
    });
  }
};

/**
 * Assign a manager to a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignManager = async (req, res) => {
  try {
    const { userId } = req.params;
    const { managerId } = req.body;
    
    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: 'Manager ID is required'
      });
    }
    
    const result = await UserReportingService.assignManagerToUser(userId, managerId);
    
    res.status(201).json({
      success: true,
      message: 'Manager assigned successfully',
      data: result
    });
  } catch (error) {
    console.error('Error assigning manager:', error);
    
    if (error.message === 'User not found' || error.message === 'Manager not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'User cannot be their own manager' || 
        error.message === 'Manager relationship already exists') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to assign manager',
      error: error.message
    });
  }
};

/**
 * Update user manager assignment (PATCH)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserManager = async (req, res) => {
  try {
    const { userId } = req.params;
    const { managerId } = req.body;
    
    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: 'Manager ID is required'
      });
    }
    
    const result = await UserReportingService.updateUserManager(userId, managerId);
    
    res.json({
      success: true,
      message: 'Manager updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating manager:', error);
    
    if (error.message === 'User not found' || error.message === 'Manager not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'User cannot be their own manager' || 
        error.message === 'User already has this manager' ||
        error.message === 'User does not have an existing manager relationship') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update manager',
      error: error.message
    });
  }
};

/**
 * Replace user manager assignment (PUT)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const replaceUserManager = async (req, res) => {
  try {
    const { userId } = req.params;
    const { managerId } = req.body;
    
    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: 'Manager ID is required'
      });
    }
    
    const result = await UserReportingService.replaceUserManager(userId, managerId);
    
    res.json({
      success: true,
      message: 'Manager replaced successfully',
      data: result
    });
  } catch (error) {
    console.error('Error replacing manager:', error);
    
    if (error.message === 'User not found' || error.message === 'Manager not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'User cannot be their own manager') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to replace manager',
      error: error.message
    });
  }
};

module.exports = {
  getDirectReportees,
  getAllReportees,
  getManager,
  getOrganizationalHierarchy,
  assignManager,
  updateUserManager,
  replaceUserManager
};
