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

module.exports = {
  getDirectReportees,
  getAllReportees,
  getManager,
  getOrganizationalHierarchy
};
