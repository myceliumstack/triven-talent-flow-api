// src/services/job-posting.service.js
const prisma = require('../config/database');

// No mapping needed - using string fields directly

class JobPostingService {
  /**
   * Get all job postings with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Job postings with pagination info
   */
  async getAllJobPostings(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      companyId,
      category,
      status,
      experienceRange,
      location,
      bdmAssigned,
      validation,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Build filters
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (companyId) where.companyId = companyId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (experienceRange) where.experienceRange = experienceRange;
    if (bdmAssigned) where.bdmAssigned = bdmAssigned;
    if (typeof validation === 'boolean') where.validation = validation;
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Build order by
    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    }

    const [jobPostings, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          company: {
            select: { id: true, name: true, industry: true, location: true }
          },
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          modifiedByUser: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      }),
      prisma.jobPosting.count({ where })
    ]);

    return {
      jobPostings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get job postings by company ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Job postings for the company
   */
  async getJobPostingsByCompanyId(companyId) {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return await prisma.jobPosting.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  /**
   * Get job posting by ID
   * @param {string} id - Job posting ID
   * @returns {Promise<Object>} Job posting details
   */
  async getJobPostingById(id) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    return jobPosting;
  }

  /**
   * Create new job posting
   * @param {Object} jobData - Job posting data
   * @param {string} createdById - User ID who created the job posting
   * @returns {Promise<Object>} Created job posting
   */
  async createJobPosting(jobData, createdById) {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: jobData.companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const jobPosting = await prisma.jobPosting.create({
      data: {
        ...jobData,
        createdById
      },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return jobPosting;
  }

  /**
   * Bulk create job postings
   * @param {Array} jobPostingsData - Array of job posting data
   * @param {string} createdById - User ID who created the job postings
   * @returns {Promise<Object>} Bulk creation result
   */
  async bulkCreateJobPostings(jobPostingsData, createdById) {
    // Verify all companies exist
    const companyIds = [...new Set(jobPostingsData.map(job => job.companyId))];
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true }
    });

    if (companies.length !== companyIds.length) {
      throw new Error('One or more companies not found');
    }

    const result = await prisma.jobPosting.createMany({
      data: jobPostingsData.map(job => ({
        ...job,
        createdById
      }))
    });

    return { count: result.count };
  }

  /**
   * Update job posting
   * @param {string} id - Job posting ID
   * @param {Object} updateData - Update data
   * @param {string} modifiedById - User ID who modified the job posting
   * @returns {Promise<Object>} Updated job posting
   */
  async updateJobPosting(id, updateData, modifiedById) {
    // Check if job posting exists
    const existingJobPosting = await prisma.jobPosting.findUnique({
      where: { id }
    });

    if (!existingJobPosting) {
      throw new Error('Job posting not found');
    }

    // Validate that the modifying user exists
    if (modifiedById) {
      const user = await prisma.user.findUnique({
        where: { id: modifiedById }
      });

      if (!user) {
        throw new Error('Invalid user ID: User not found');
      }
    }

    try {
      const jobPosting = await prisma.jobPosting.update({
        where: { id },
        data: {
          ...updateData,
          modifiedById
        },
        include: {
          company: {
            select: { id: true, name: true, industry: true, location: true }
          },
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          modifiedByUser: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      return jobPosting;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('Invalid user reference: The specified user does not exist');
      }
      throw error;
    }
  }

  /**
   * Delete job posting
   * @param {string} id - Job posting ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteJobPosting(id) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id }
    });

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    await prisma.jobPosting.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Bulk delete job postings
   * @param {Array} ids - Array of job posting IDs
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteJobPostings(ids) {
    const result = await prisma.jobPosting.deleteMany({
      where: { id: { in: ids } }
    });

    return { count: result.count };
  }

  /**
   * Get job posting statistics
   * @returns {Promise<Object>} Job posting statistics
   */
  async getJobPostingStats() {
    const [total, active, closed, onHold, draft, byCategory] = await Promise.all([
      prisma.jobPosting.count(),
      prisma.jobPosting.count({ where: { status: 'Active' } }),
      prisma.jobPosting.count({ where: { status: 'Closed' } }),
      prisma.jobPosting.count({ where: { status: 'On Hold' } }),
      prisma.jobPosting.count({ where: { status: 'Draft' } }),
      prisma.jobPosting.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10
      })
    ]);

    return {
      total,
      byStatus: {
        active,
        closed,
        onHold,
        draft
      },
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count.category
      }))
    };
  }

  /**
   * Get job posting statistics for a specific company
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Company job posting statistics
   */
  async getCompanyJobPostingStats(companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const [total, active, closed, onHold, draft] = await Promise.all([
      prisma.jobPosting.count({ where: { companyId } }),
      prisma.jobPosting.count({ where: { companyId, status: 'Active' } }),
      prisma.jobPosting.count({ where: { companyId, status: 'Closed' } }),
      prisma.jobPosting.count({ where: { companyId, status: 'On Hold' } }),
      prisma.jobPosting.count({ where: { companyId, status: 'Draft' } })
    ]);

    return {
      total,
      byStatus: {
        active,
        closed,
        onHold,
        draft
      }
    };
  }

  /**
   * Get job postings by category
   * @param {string} category - Job category
   * @returns {Promise<Array>} Job postings in the category
   */
  async getJobPostingsByCategory(category) {
    return await prisma.jobPosting.findMany({
      where: { category },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get job postings by status
   * @param {string} status - Job status
   * @returns {Promise<Array>} Job postings with the status
   */
  async getJobPostingsByStatus(status) {
    return await prisma.jobPosting.findMany({
      where: { status },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Search job postings
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching job postings
   */
  async searchJobPostings(query) {
    if (!query || query.length < 2) {
      return [];
    }

    return await prisma.jobPosting.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { company: { name: { contains: query, mode: 'insensitive' } } }
        ]
      },
      select: {
        id: true,
        title: true,
        location: true,
        category: true,
        status: true,
        validation: true,
        company: {
          select: { name: true }
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get job postings by validation status
   * @param {boolean} validationStatus - Validation status (true/false)
   * @returns {Promise<Array>} Job postings with the validation status
   */
  async getJobPostingsByValidation(validationStatus) {
    return await prisma.jobPosting.findMany({
      where: { validation: validationStatus },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Update validation status of a job posting
   * @param {string} id - Job posting ID
   * @param {boolean} validationStatus - New validation status
   * @param {string} modifiedById - User ID who modified the job posting
   * @returns {Promise<Object>} Updated job posting
   */
  async updateJobPostingValidation(id, validationStatus, modifiedById) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id }
    });

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    return await prisma.jobPosting.update({
      where: { id },
      data: {
        validation: validationStatus,
        modifiedById
      },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }
}

module.exports = new JobPostingService();
