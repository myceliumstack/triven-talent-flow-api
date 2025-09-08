// src/controllers/company.controller.js
const CompanyService = require('../services/company.service');

class CompanyController {
  /**
   * Get all companies with pagination and filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanies(req, res) {
    try {
      const {
        page,
        limit,
        search,
        industry,
        size,
        agreementStatus,
        location,
        sortBy,
        sortOrder
      } = req.query;

      const result = await CompanyService.getAllCompanies({
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        search,
        industry,
        size,
        agreementStatus,
        location,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        message: 'Companies retrieved successfully',
        data: result.companies,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Search companies
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchCompanies(req, res) {
    try {
      const { q: query } = req.query;
      
      const companies = await CompanyService.searchCompanies(query);

      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: companies
      });
    } catch (error) {
      console.error('Error searching companies:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get company by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanyById(req, res) {
    try {
      const { id } = req.params;

      const company = await CompanyService.getCompanyById(id);

      res.status(200).json({
        success: true,
        message: 'Company retrieved successfully',
        data: { company }
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      
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
   * Create new company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCompany(req, res) {
    try {
      const companyData = req.validatedData;
      const createdById = req.user.userId;

      const company = await CompanyService.createCompany(companyData, createdById);

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: { company }
      });
    } catch (error) {
      console.error('Error creating company:', error);
      
      if (error.message === 'Company with this name already exists') {
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
   * Update company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;
      const modifiedById = req.user.userId;

      const company = await CompanyService.updateCompany(id, updateData, modifiedById);

      res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: { company }
      });
    } catch (error) {
      console.error('Error updating company:', error);
      
      if (error.message === 'Company not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Company with this name already exists') {
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
   * Delete company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCompany(req, res) {
    try {
      const { id } = req.params;

      await CompanyService.deleteCompany(id);

      res.status(200).json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      
      if (error.message === 'Company not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Cannot delete company with associated POCs or job postings') {
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
  }

  /**
   * Get company statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanyStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await CompanyService.getCompanyStats(id);

      res.status(200).json({
        success: true,
        message: 'Company statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Error fetching company stats:', error);
      
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
   * Get companies by industry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompaniesByIndustry(req, res) {
    try {
      const { industry } = req.params;

      const companies = await CompanyService.getCompaniesByIndustry(industry);

      res.status(200).json({
        success: true,
        message: 'Companies retrieved successfully',
        data: { companies }
      });
    } catch (error) {
      console.error('Error fetching companies by industry:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get companies by agreement status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompaniesByAgreementStatus(req, res) {
    try {
      const { status } = req.params;

      const companies = await CompanyService.getCompaniesByAgreementStatus(status);

      res.status(200).json({
        success: true,
        message: 'Companies retrieved successfully',
        data: { companies }
      });
    } catch (error) {
      console.error('Error fetching companies by agreement status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get job postings for a specific company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanyJobPostings(req, res) {
    try {
      const { id: companyId } = req.params;

      const JobPostingService = require('../services/job-posting.service');
      const jobPostings = await JobPostingService.getJobPostingsByCompanyId(companyId);

      res.status(200).json({
        success: true,
        message: 'Company job postings retrieved successfully',
        data: { jobPostings }
      });
    } catch (error) {
      console.error('Error fetching company job postings:', error);
      
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
   * Get POCs for a specific company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanyPOCs(req, res) {
    try {
      const { id: companyId } = req.params;

      const POCService = require('../services/poc.service');
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
}

module.exports = new CompanyController();
