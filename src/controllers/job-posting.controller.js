// src/controllers/job-posting.controller.js
const JobPostingService = require('../services/job-posting.service');

class JobPostingController {
  /**
   * Get all job postings with pagination and filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJobPostings(req, res) {
    try {
      const {
        page,
        limit,
        search,
        companyId,
        category,
        status,
        experienceRange,
        location,
        bdmAssigned,
        sortBy,
        sortOrder
      } = req.query;

      const result = await JobPostingService.getAllJobPostings({
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        search,
        companyId,
        category,
        status,
        experienceRange,
        location,
        bdmAssigned,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        message: 'Job postings retrieved successfully',
        data: result.jobPostings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching job postings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get job postings by company ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJobPostingsByCompanyId(req, res) {
    try {
      const { companyId } = req.params;

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
   * Get job posting by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJobPostingById(req, res) {
    try {
      const { id } = req.params;

      const jobPosting = await JobPostingService.getJobPostingById(id);

      res.status(200).json({
        success: true,
        message: 'Job posting retrieved successfully',
        data: { jobPosting }
      });
    } catch (error) {
      console.error('Error fetching job posting:', error);
      
      if (error.message === 'Job posting not found') {
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
   * Create new job posting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createJobPosting(req, res) {
    try {
      const jobData = req.validatedData;
      const createdById = req.user.userId;

      const jobPosting = await JobPostingService.createJobPosting(jobData, createdById);

      res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        data: { jobPosting }
      });
    } catch (error) {
      console.error('Error creating job posting:', error);
      
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
   * Bulk create job postings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async bulkCreateJobPostings(req, res) {
    try {
      const { jobPostings: jobPostingsData } = req.validatedData;
      const createdById = req.user.userId;

      const result = await JobPostingService.bulkCreateJobPostings(jobPostingsData, createdById);

      res.status(201).json({
        success: true,
        message: 'Job postings created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error bulk creating job postings:', error);
      
      if (error.message === 'One or more companies not found') {
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
   * Update job posting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateJobPosting(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;
      const modifiedById = req.user.userId;

      const jobPosting = await JobPostingService.updateJobPosting(id, updateData, modifiedById);

      res.status(200).json({
        success: true,
        message: 'Job posting updated successfully',
        data: { jobPosting }
      });
    } catch (error) {
      console.error('Error updating job posting:', error);
      
      if (error.message === 'Job posting not found') {
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
   * Delete job posting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteJobPosting(req, res) {
    try {
      const { id } = req.params;

      await JobPostingService.deleteJobPosting(id);

      res.status(200).json({
        success: true,
        message: 'Job posting deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job posting:', error);
      
      if (error.message === 'Job posting not found') {
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
   * Bulk delete job postings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async bulkDeleteJobPostings(req, res) {
    try {
      const { ids } = req.validatedData;

      const result = await JobPostingService.bulkDeleteJobPostings(ids);

      res.status(200).json({
        success: true,
        message: `${result.count} job postings deleted successfully`,
        data: result
      });
    } catch (error) {
      console.error('Error bulk deleting job postings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get job posting statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJobPostingStats(req, res) {
    try {
      const stats = await JobPostingService.getJobPostingStats();

      res.status(200).json({
        success: true,
        message: 'Job posting statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Error fetching job posting stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get job posting statistics for a specific company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanyJobPostingStats(req, res) {
    try {
      const { companyId } = req.params;

      const stats = await JobPostingService.getCompanyJobPostingStats(companyId);

      res.status(200).json({
        success: true,
        message: 'Company job posting statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Error fetching company job posting stats:', error);
      
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
   * Search job postings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchJobPostings(req, res) {
    try {
      const { q: query } = req.query;
      
      const jobPostings = await JobPostingService.searchJobPostings(query);

      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: jobPostings
      });
    } catch (error) {
      console.error('Error searching job postings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get job postings by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJobPostingsByCategory(req, res) {
    try {
      const { category } = req.params;

      const jobPostings = await JobPostingService.getJobPostingsByCategory(category);

      res.status(200).json({
        success: true,
        message: 'Job postings retrieved successfully',
        data: { jobPostings }
      });
    } catch (error) {
      console.error('Error fetching job postings by category:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get job postings by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJobPostingsByStatus(req, res) {
    try {
      const { status } = req.params;

      const jobPostings = await JobPostingService.getJobPostingsByStatus(status);

      res.status(200).json({
        success: true,
        message: 'Job postings retrieved successfully',
        data: { jobPostings }
      });
    } catch (error) {
      console.error('Error fetching job postings by status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new JobPostingController();
