// src/controllers/filter.controller.js
const filterService = require('../services/filter.service');

// Get all BDM users
const getAllBDMUsers = async (req, res) => {
  try {
    const bdmUsers = await filterService.getAllBDMUsers();

    res.json({
      success: true,
      data: bdmUsers,
      message: 'BDM users retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting BDM users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get BDM users',
      error: error.message
    });
  }
};

// Get BDM users by entities
const getBDMUsersByEntities = async (req, res) => {
  try {
    const { entityIds } = req.query;

    // Validate that entityIds is provided
    if (!entityIds) {
      return res.status(400).json({
        success: false,
        message: 'entityIds query parameter is required'
      });
    }

    // Parse entityIds (can be comma-separated string or array)
    let entityIdArray;
    if (typeof entityIds === 'string') {
      entityIdArray = entityIds.split(',').map(id => id.trim()).filter(id => id);
    } else if (Array.isArray(entityIds)) {
      entityIdArray = entityIds;
    } else {
      return res.status(400).json({
        success: false,
        message: 'entityIds must be a comma-separated string or array'
      });
    }

    if (entityIdArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one entity ID is required'
      });
    }

    const bdmUsers = await filterService.getBDMUsersByEntities(entityIdArray);

    res.json({
      success: true,
      data: bdmUsers,
      message: `BDM users retrieved for ${entityIdArray.length} entity(ies)`
    });
  } catch (error) {
    console.error('Error getting BDM users by entities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get BDM users by entities',
      error: error.message
    });
  }
};

module.exports = {
  getAllBDMUsers,
  getBDMUsersByEntities
};
