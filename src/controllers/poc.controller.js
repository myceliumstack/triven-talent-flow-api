// src/controllers/poc.controller.js
const POCService = require('../services/poc.service');

class POCController {
  /**
   * Get all POCs with pagination and filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPOCs(req, res) {
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
  }

  /**
   * Get POCs by company ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPOCsByCompanyId(req, res) {
    try {
      const { companyId } = req.params;

      const pocs = await POCService.getPOCsByCompanyId(companyId);

      res.status(200).json({
        success: true,
        message: 'Company POCs retrieved successfully',
        data: { pocs }
      });
    } catch (error) {
      console.error('Error fetching company POCs:', error);
      
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
  }

  /**
   * Get POC by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPOCById(req, res) {
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
  }

  /**
   * Create new POC
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPOC(req, res) {
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

      if (error.message === 'POC with this email already exists') {
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
  }

  /**
   * Update POC
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePOC(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;
      const modifiedById = req.user.userId;

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

      if (error.message === 'POC with this email already exists') {
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
  }

  /**
   * Delete POC
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deletePOC(req, res) {
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
  }

  /**
   * Search POCs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchPOCs(req, res) {
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
  }

  /**
   * Get POCs by designation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPOCsByDesignation(req, res) {
    try {
      const { designation } = req.params;

      const pocs = await POCService.getPOCsByDesignation(designation);

      res.status(200).json({
        success: true,
        message: 'POCs retrieved successfully',
        data: { pocs }
      });
    } catch (error) {
      console.error('Error fetching POCs by designation:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get POCs by department
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPOCsByDepartment(req, res) {
    try {
      const { department } = req.params;

      const pocs = await POCService.getPOCsByDepartment(department);

      res.status(200).json({
        success: true,
        message: 'POCs retrieved successfully',
        data: { pocs }
      });
    } catch (error) {
      console.error('Error fetching POCs by department:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get POC statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPOCStats(req, res) {
    try {
      const stats = await POCService.getPOCStats();

      res.status(200).json({
        success: true,
        message: 'POC statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Error fetching POC stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get POC statistics for a specific company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanyPOCStats(req, res) {
    try {
      const { companyId } = req.params;

      const stats = await POCService.getCompanyPOCStats(companyId);

      res.status(200).json({
        success: true,
        message: 'Company POC statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Error fetching company POC stats:', error);
      
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
  }
}

module.exports = new POCController();
