// src/controllers/poc.controller.js
const POCService = require('../services/poc.service');

/**
 * Get all POCs with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPOCs = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      companyId,
      designation,
      department
    } = req.query;

    const result = await POCService.getAllPOCs({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      companyId,
      designation,
      department
    });

    res.status(200).json({
      success: true,
      message: 'POCs retrieved successfully',
      data: result.pocs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching POCs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get POCs by company ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPOCsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    const pocs = await POCService.getPOCsByCompanyId(companyId);

    res.status(200).json({
      success: true,
      message: 'POCs retrieved successfully',
      data: { pocs }
    });
  } catch (error) {
    console.error('Error fetching POCs by company:', error);
    
    if (error.message === 'Company not found') {
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
 * Search POCs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchPOCs = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    const pocs = await POCService.searchPOCs(query);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: pocs
    });
  } catch (error) {
    console.error('Error searching POCs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get POC by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPOCById = async (req, res) => {
  try {
    const { id } = req.params;
    const poc = await POCService.getPOCById(id);

    res.status(200).json({
      success: true,
      message: 'POC retrieved successfully',
      data: { poc }
    });
  } catch (error) {
    console.error('Error fetching POC:', error);
    
    if (error.message === 'POC not found') {
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
 * Create new POC
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPOC = async (req, res) => {
  try {
    const pocData = req.validatedData;
    const createdById = req.user.userId;

    const poc = await POCService.createPOC(pocData, createdById);

    res.status(201).json({
      success: true,
      message: 'POC created successfully',
      data: { poc }
    });
  } catch (error) {
    console.error('Error creating POC:', error);
    
    if (error.message === 'Company not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'POC with this email already exists for this company') {
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
 * Update POC
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePOC = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;
    const modifiedById = req.user?.userId;

    // Validate that user ID exists
    if (!modifiedById) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const poc = await POCService.updatePOC(id, updateData, modifiedById);

    res.status(200).json({
      success: true,
      message: 'POC updated successfully',
      data: { poc }
    });
  } catch (error) {
    console.error('Error updating POC:', error);
    
    if (error.message === 'POC not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'POC with this email already exists for this company') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    // Handle user validation errors
    if (error.message === 'Invalid user ID: User not found' || 
        error.message === 'Invalid user reference: The specified user does not exist') {
      return res.status(400).json({
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
 * Delete POC
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePOC = async (req, res) => {
  try {
    const { id } = req.params;
    await POCService.deletePOC(id);

    res.status(200).json({
      success: true,
      message: 'POC deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting POC:', error);
    
    if (error.message === 'POC not found') {
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
 * Get POCs by designation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPOCsByDesignation = async (req, res) => {
  try {
    const { designation } = req.params;
    const pocs = await POCService.getPOCsByDesignation(designation);

    res.status(200).json({
      success: true,
      message: `POCs with designation ${designation} retrieved successfully`,
      data: { pocs }
    });
  } catch (error) {
    console.error('Error fetching POCs by designation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get POCs by department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPOCsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const pocs = await POCService.getPOCsByDepartment(department);

    res.status(200).json({
      success: true,
      message: `POCs in ${department} department retrieved successfully`,
      data: { pocs }
    });
  } catch (error) {
    console.error('Error fetching POCs by department:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get POC statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPOCStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await POCService.getPOCStats(id);

    res.status(200).json({
      success: true,
      message: 'POC statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching POC stats:', error);
    
    if (error.message === 'POC not found') {
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
 * Bulk create POCs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkCreatePOCs = async (req, res) => {
  try {
    const { pocs } = req.validatedData;
    const createdById = req.user.userId;

    const result = await POCService.bulkCreatePOCs(pocs, createdById);

    res.status(201).json({
      success: true,
      message: 'POCs created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error bulk creating POCs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Bulk delete POCs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkDeletePOCs = async (req, res) => {
  try {
    const { ids } = req.validatedData;

    const result = await POCService.bulkDeletePOCs(ids);

    res.status(200).json({
      success: true,
      message: 'POCs deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error bulk deleting POCs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getPOCs,
  getPOCsByCompanyId,
  searchPOCs,
  getPOCById,
  createPOC,
  updatePOC,
  deletePOC,
  getPOCsByDesignation,
  getPOCsByDepartment,
  getPOCStats,
  bulkCreatePOCs,
  bulkDeletePOCs
};