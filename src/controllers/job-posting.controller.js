// src/controllers/job-posting.controller.js
const JobPostingService = require('../services/job-posting.service');

  /**
   * Get all job postings with pagination and filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const getJobPostings = async (req, res) => {
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
      validation,
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
      validation: validation === 'true' ? true : validation === 'false' ? false : undefined,
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
};

  /**
 * Search job postings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const searchJobPostings = async (req, res) => {
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
};

  /**
   * Get job posting by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const getJobPostingById = async (req, res) => {
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
};

  /**
   * Create new job posting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const createJobPosting = async (req, res) => {
    try {
    const jobPostingData = req.validatedData;
      const createdById = req.user.userId;

    const jobPosting = await JobPostingService.createJobPosting(jobPostingData, createdById);

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
};

  /**
 * Update job posting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const updateJobPosting = async (req, res) => {
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
   * Delete job posting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const deleteJobPosting = async (req, res) => {
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
};

  /**
 * Get job postings by company ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const getJobPostingsByCompanyId = async (req, res) => {
    try {
      const { companyId } = req.params;
      
      console.log('🏢 Fetching job postings for company ID:', companyId);
      
      const jobPostings = await JobPostingService.getJobPostingsByCompanyId(companyId);

      console.log('✅ Successfully fetched', jobPostings.length, 'job postings for company:', companyId);

      res.status(200).json({
        success: true,
        message: 'Job postings retrieved successfully',
        data: { jobPostings }
      });
    } catch (error) {
      console.error('❌ Error fetching job postings by company:', {
        companyId: req.params.companyId,
        error: error.message,
        stack: error.stack
      });
      
      if (error.message === 'Company not found') {
        console.log('📍 Company not found, returning 404');
        return res.status(404).json({
          success: false,
          message: `Company with ID ${req.params.companyId} not found`
        });
      }

      console.log('📍 Unexpected error, returning 500');
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  /**
   * Get job postings by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const getJobPostingsByCategory = async (req, res) => {
    try {
      const { category } = req.params;
      const jobPostings = await JobPostingService.getJobPostingsByCategory(category);

      res.status(200).json({
        success: true,
      message: `Job postings in ${category} category retrieved successfully`,
        data: { jobPostings }
      });
    } catch (error) {
      console.error('Error fetching job postings by category:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
};

  /**
   * Get job postings by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
const getJobPostingsByStatus = async (req, res) => {
    try {
      const { status } = req.params;
      const jobPostings = await JobPostingService.getJobPostingsByStatus(status);

      res.status(200).json({
        success: true,
      message: `Job postings with ${status} status retrieved successfully`,
        data: { jobPostings }
      });
    } catch (error) {
      console.error('Error fetching job postings by status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
};

/**
 * Get job postings by validation status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobPostingsByValidation = async (req, res) => {
  try {
    const { validation } = req.params;
    const validationStatus = validation === 'true';
    
    const jobPostings = await JobPostingService.getJobPostingsByValidation(validationStatus);

    res.status(200).json({
      success: true,
      message: `Job postings with validation ${validation} retrieved successfully`,
      data: { jobPostings }
    });
  } catch (error) {
    console.error('Error fetching job postings by validation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update job posting validation status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateJobPostingValidation = async (req, res) => {
  try {
    const { id } = req.params;
    const { validation } = req.body;
    const modifiedById = req.user.userId;

    const jobPosting = await JobPostingService.updateJobPostingValidation(id, validation, modifiedById);

    res.status(200).json({
      success: true,
      message: 'Job posting validation updated successfully',
      data: { jobPosting }
    });
  } catch (error) {
    console.error('Error updating job posting validation:', error);
    
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
};

/**
 * Get job posting statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobPostingStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await JobPostingService.getJobPostingStats(id);

    res.status(200).json({
      success: true,
      message: 'Job posting statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching job posting stats:', error);
    
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
};

/**
 * Assign BDM to job posting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignBDMToJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const { bdmId } = req.body;
    const modifiedById = req.user.userId;

    const jobPosting = await JobPostingService.assignBDMToJobPosting(id, bdmId, modifiedById);

    res.status(200).json({
      success: true,
      message: 'BDM assigned to job posting successfully',
      data: { jobPosting }
    });
  } catch (error) {
    console.error('Error assigning BDM to job posting:', error);
    
    if (error.message === 'Job posting not found' || error.message === 'BDM not found') {
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
 * Get job postings by experience range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobPostingsByExperience = async (req, res) => {
  try {
    const { experience } = req.params;
    const jobPostings = await JobPostingService.getJobPostingsByExperience(experience);

    res.status(200).json({
      success: true,
      message: `Job postings for ${experience} experience retrieved successfully`,
      data: { jobPostings }
    });
  } catch (error) {
    console.error('Error fetching job postings by experience:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all companies (helper endpoint for frontend)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCompanies = async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const companies = await prisma.company.findMany({
      select: { id: true, name: true, industry: true, location: true },
      orderBy: { name: 'asc' }
    });
    
    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      message: 'Companies retrieved successfully',
      data: companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


module.exports = {
  getJobPostings,
  searchJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobPostingsByCompanyId,
  getJobPostingsByCategory,
  getJobPostingsByStatus,
  getJobPostingsByValidation,
  updateJobPostingValidation,
  getJobPostingStats,
  assignBDMToJobPosting,
  getJobPostingsByExperience,
  getAllCompanies
};