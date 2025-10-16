// src/services/job-posting.service.js
const prisma = require('../config/database');

// Lightweight include object for list views (optimized for performance)
const jobPostingListIncludes = {
  company: {
    select: { id: true, name: true }
  },
  status: {
    select: { id: true, name: true }
  }
};

// Medium include object for search/filter views
const jobPostingSearchIncludes = {
  company: {
    select: { id: true, name: true, industry: true }
  },
  status: {
    select: { id: true, name: true, isActive: true }
  },
  createdByUser: {
    select: { id: true, firstName: true, lastName: true }
  }
};

// Full include object for detail views (only when needed)
const jobPostingDetailIncludes = {
  company: {
    select: { id: true, name: true, industry: true, location: true }
  },
  status: {
    select: { id: true, name: true, isActive: true }
  },
  createdByUser: {
    select: { id: true, firstName: true, lastName: true, email: true }
  },
  modifiedByUser: {
    select: { id: true, firstName: true, lastName: true, email: true }
  },
  jobs: {
    select: {
      id: true,
      jobCode: true,
      title: true,
      status: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      createdAt: true
    }
  }
};

/**
 * Get all job posting statuses
 * @returns {Promise<Array>} Job posting statuses
 */
const getAllStatuses = async () => {
    return await prisma.jobPostingStatus.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
};

/**
 * Get job posting status by ID
 * @param {string} id - Status ID
 * @returns {Promise<Object>} Job posting status
 */
const getStatusById = async (id) => {
    const status = await prisma.jobPostingStatus.findUnique({
      where: { id }
    });

    if (!status) {
      throw new Error('Job posting status not found');
    }

    return status;
};

/**
 * Create new job posting status
 * @param {Object} statusData - Status data
 * @returns {Promise<Object>} Created status
 */
const createStatus = async (statusData) => {
    // Check if status with same name already exists
    const existingStatus = await prisma.jobPostingStatus.findFirst({
      where: { name: statusData.name }
    });

    if (existingStatus) {
      throw new Error('Status with this name already exists');
    }

    return await prisma.jobPostingStatus.create({
      data: statusData
    });
};

/**
 * Update job posting status
 * @param {string} id - Status ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated status
 */
const updateStatus = async (id, updateData) => {
    const existingStatus = await prisma.jobPostingStatus.findUnique({
      where: { id }
    });

    if (!existingStatus) {
      throw new Error('Job posting status not found');
    }

    // Check for name conflict if name is being updated
    if (updateData.name && updateData.name !== existingStatus.name) {
      const nameConflict = await prisma.jobPostingStatus.findFirst({
        where: { 
          name: updateData.name,
          id: { not: id }
        }
      });

      if (nameConflict) {
        throw new Error('Status with this name already exists');
      }
    }

    return await prisma.jobPostingStatus.update({
      where: { id },
      data: updateData
    });
};

/**
 * Delete job posting status
 * @param {string} id - Status ID
 * @returns {Promise<boolean>} Success status
 */
const deleteStatus = async (id) => {
    // Check if status exists
    const status = await prisma.jobPostingStatus.findUnique({
      where: { id },
      include: {
        _count: {
          select: { jobPostings: true }
        }
      }
    });

    if (!status) {
      throw new Error('Job posting status not found');
    }

    // Check if status is being used by any job postings
    if (status._count.jobPostings > 0) {
      throw new Error('Cannot delete status that is being used by job postings');
    }

    await prisma.jobPostingStatus.delete({
      where: { id }
    });

    return true;
};

/**
 * Get all job postings with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Job postings with pagination info
 */
const getAllJobPostings = async (options = {}) => {
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
    if (status) {
      // Handle both statusId and status name
      if (status.length === 25) { // CUID length
        where.statusId = status;
      } else {
        where.status = { name: status };
      }
    }
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
      // Handle relation fields specially
      if (sortBy === 'status') {
        orderBy.status = {
          name: sortOrder
        };
      } else if (sortBy === 'company') {
        orderBy.company = {
          name: sortOrder
        };
      } else {
        // For direct fields on JobPosting model
        orderBy[sortBy] = sortOrder;
      }
    }

    const [jobPostings, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: jobPostingListIncludes
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
};

/**
 * Get job postings by company ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} Job postings for the company
 */
const getJobPostingsByCompanyId = async (companyId) => {
    console.log('🔍 JobPostingService: Checking company existence for ID:', companyId);
    
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      console.log('❌ JobPostingService: Company not found for ID:', companyId);
      throw new Error('Company not found');
    }

    console.log('✅ JobPostingService: Company found:', company.name, 'fetching job postings...');

    const jobPostings = await prisma.jobPosting.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: jobPostingListIncludes
    });

    console.log('✅ JobPostingService: Found', jobPostings.length, 'job postings for company:', company.name);
    return jobPostings;
};

/**
 * Get job posting by ID
 * @param {string} id - Job posting ID
 * @returns {Promise<Object>} Job posting details
 */
const getJobPostingById = async (id) => {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id },
      include: jobPostingDetailIncludes
    });

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    return jobPosting;
};

/**
 * Create new job posting
 * @param {Object} jobData - Job posting data
 * @param {string} createdById - User ID who created the job posting
 * @returns {Promise<Object>} Created job posting
 */
const createJobPosting = async (jobData, createdById) => {
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
};

/**
 * Bulk create job postings
 * @param {Array} jobPostingsData - Array of job posting data
 * @param {string} createdById - User ID who created the job postings
 * @returns {Promise<Object>} Bulk creation result
 */
const bulkCreateJobPostings = async (jobPostingsData, createdById) => {
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
};

/**
 * Update job posting
 * @param {string} id - Job posting ID
 * @param {Object} updateData - Update data
 * @param {string} modifiedById - User ID who modified the job posting
 * @returns {Promise<Object>} Updated job posting
 */
const updateJobPosting = async (id, updateData, modifiedById) => {
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
        include: jobPostingDetailIncludes
      });

      return jobPosting;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('Invalid user reference: The specified user does not exist');
      }
      throw error;
    }
};

/**
 * Delete job posting
 * @param {string} id - Job posting ID
 * @returns {Promise<boolean>} Success status
 */
const deleteJobPosting = async (id) => {
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
};

/**
 * Bulk delete job postings
 * @param {Array} ids - Array of job posting IDs
 * @returns {Promise<Object>} Bulk deletion result
 */
const bulkDeleteJobPostings = async (ids) => {
    const result = await prisma.jobPosting.deleteMany({
      where: { id: { in: ids } }
    });

    return { count: result.count };
};

/**
 * Get job posting statistics
 * @returns {Promise<Object>} Job posting statistics
 */
const getJobPostingStats = async () => {
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
};

/**
 * Get job posting statistics for a specific company
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company job posting statistics
 */
const getCompanyJobPostingStats = async (companyId) => {
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
};

/**
 * Get job postings by category
 * @param {string} category - Job category
 * @returns {Promise<Array>} Job postings in the category
 */
const getJobPostingsByCategory = async (category) => {
    return await prisma.jobPosting.findMany({
      where: { category },
      include: jobPostingListIncludes,
      orderBy: { createdAt: 'desc' }
    });
};

/**
 * Get job postings by status
 * @param {string} status - Job status
 * @returns {Promise<Array>} Job postings with the status
 */
const getJobPostingsByStatus = async (status) => {
    const where = {};
    
    // Handle both statusId and status name
    if (status.length === 25) { // CUID length
      where.statusId = status;
    } else {
      where.status = { name: status };
    }

    return await prisma.jobPosting.findMany({
      where,
      include: jobPostingListIncludes,
      orderBy: { createdAt: 'desc' }
    });
};

/**
 * Search job postings
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching job postings
 */
const searchJobPostings = async (query) => {
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
};

/**
 * Get job postings by validation status
 * @param {boolean} validationStatus - Validation status (true/false)
 * @returns {Promise<Array>} Job postings with the validation status
 */
const getJobPostingsByValidation = async (validationStatus) => {
    return await prisma.jobPosting.findMany({
      where: { validation: validationStatus },
      include: jobPostingSearchIncludes,
      orderBy: { createdAt: 'desc' }
    });
};

/**
 * Update validation status of a job posting
 * @param {string} id - Job posting ID
 * @param {boolean} validationStatus - New validation status
 * @param {string} modifiedById - User ID who modified the job posting
 * @returns {Promise<Object>} Updated job posting
 */
const updateJobPostingValidation = async (id, validationStatus, modifiedById) => {
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
};

/**
 * Bulk validate multiple job postings
 * @param {Array} jobPostingIds - Array of job posting IDs to validate
 * @param {string} validatedById - ID of the user performing validation
 * @returns {Promise<Object>} Bulk validation results
 */
const bulkValidateJobPostings = async (jobPostingIds, validatedById) => {
    try {
      if (!jobPostingIds || !Array.isArray(jobPostingIds) || jobPostingIds.length === 0) {
        throw new Error('Job posting IDs array is required and must not be empty');
      }

      const results = [];
      const errors = [];
      let validatedCount = 0;
      let failedCount = 0;

      // Process each job posting
      for (const jobPostingId of jobPostingIds) {
        try {
          // Find the job posting
          const jobPosting = await prisma.jobPosting.findUnique({
            where: { id: jobPostingId },
            select: { id: true, validation: true, title: true }
          });

          if (!jobPosting) {
            errors.push({
              id: jobPostingId,
              error: 'Job posting not found'
            });
            failedCount++;
            continue;
          }

          // Check if already validated
          if (jobPosting.validation === true) {
            errors.push({
              id: jobPostingId,
              error: 'Job posting already validated'
            });
            failedCount++;
            continue;
          }

          // Update validation status
          await prisma.jobPosting.update({
            where: { id: jobPostingId },
            data: {
              validation: true,
              modifiedById: validatedById,
              updatedAt: new Date()
            }
          });

          results.push({
            id: jobPostingId,
            title: jobPosting.title,
            status: 'validated',
            message: 'Successfully validated'
          });
          validatedCount++;

        } catch (error) {
          errors.push({
            id: jobPostingId,
            error: error.message
          });
          failedCount++;
        }
      }

      return {
        success: true,
        validatedCount,
        failedCount,
        results,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      throw new Error(`Bulk validation failed: ${error.message}`);
    }
};

/**
 * Bulk unvalidate multiple job postings
 * @param {Array} jobPostingIds - Array of job posting IDs to unvalidate
 * @param {string} unvalidatedById - ID of the user performing unvalidation
 * @returns {Promise<Object>} Bulk unvalidation results
 */
const bulkUnvalidateJobPostings = async (jobPostingIds, unvalidatedById) => {
    try {
      if (!jobPostingIds || !Array.isArray(jobPostingIds) || jobPostingIds.length === 0) {
        throw new Error('Job posting IDs array is required and must not be empty');
      }

      const results = [];
      const errors = [];
      let unvalidatedCount = 0;
      let failedCount = 0;

      // Process each job posting
      for (const jobPostingId of jobPostingIds) {
        try {
          // Find the job posting
          const jobPosting = await prisma.jobPosting.findUnique({
            where: { id: jobPostingId },
            select: { id: true, validation: true, title: true }
          });

          if (!jobPosting) {
            errors.push({
              id: jobPostingId,
              error: 'Job posting not found'
            });
            failedCount++;
            continue;
          }

          // Check if already unvalidated
          if (jobPosting.validation === false) {
            errors.push({
              id: jobPostingId,
              error: 'Job posting already unvalidated'
            });
            failedCount++;
            continue;
          }

          // Update validation status
          await prisma.jobPosting.update({
            where: { id: jobPostingId },
            data: {
              validation: false,
              modifiedById: unvalidatedById,
              updatedAt: new Date()
            }
          });

          results.push({
            id: jobPostingId,
            title: jobPosting.title,
            status: 'unvalidated',
            message: 'Successfully unvalidated'
          });
          unvalidatedCount++;

        } catch (error) {
          errors.push({
            id: jobPostingId,
            error: error.message
          });
          failedCount++;
        }
      }

      return {
        success: true,
        unvalidatedCount,
        failedCount,
        results,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      throw new Error(`Bulk unvalidation failed: ${error.message}`);
    }
};

/**
 * Bulk assign job postings to entities
 * @param {Array} jobPostingIds - Array of job posting IDs
 * @param {Array} entityIds - Array of entity IDs to assign to
 * @param {string} assignedById - User ID who is making the assignment
 * @param {string} assignedUserId - User ID to assign to (BDM)
 * @param {string} statusId - Job posting status ID
 * @param {string} priority - Priority level (high, normal, low)
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} Assignment results
 */
const bulkAssignJobPostingsToEntities = async (jobPostingIds, entityIds, assignedById, assignedUserId, statusId, priority = 'normal', notes = null) => {
    try {
      // Validate that all job postings exist
      const existingJobPostings = await prisma.jobPosting.findMany({
        where: { id: { in: jobPostingIds } },
        select: { id: true, title: true }
      });

      if (existingJobPostings.length !== jobPostingIds.length) {
        const foundIds = existingJobPostings.map(jp => jp.id);
        const missingIds = jobPostingIds.filter(id => !foundIds.includes(id));
        throw new Error(`Job postings not found: ${missingIds.join(', ')}`);
      }

      // Validate that all entities exist
      const existingEntities = await prisma.entity.findMany({
        where: { id: { in: entityIds } },
        select: { id: true, name: true }
      });

      if (existingEntities.length !== entityIds.length) {
        const foundIds = existingEntities.map(e => e.id);
        const missingIds = entityIds.filter(id => !foundIds.includes(id));
        throw new Error(`Entities not found: ${missingIds.join(', ')}`);
      }

      // Validate assigned user exists
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedUserId },
        select: { id: true, firstName: true, lastName: true }
      });

      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }

      // Validate status exists
      const status = await prisma.jobPostingStatus.findUnique({
        where: { id: statusId },
        select: { id: true, name: true }
      });

      if (!status) {
        throw new Error('Job posting status not found');
      }

      // Check for existing assignments to avoid duplicates
      const existingAssignments = await prisma.jobPostingAssignment.findMany({
        where: {
          jobPostingId: { in: jobPostingIds },
          entityId: { in: entityIds }
        },
        select: {
          jobPostingId: true,
          entityId: true,
          jobPosting: { select: { title: true } },
          entity: { select: { name: true } }
        }
      });

      // Create assignments data
      const assignmentsData = [];
      const skippedAssignments = [];

      for (const jobPostingId of jobPostingIds) {
        for (const entityId of entityIds) {
          // Check if assignment already exists
          const existingAssignment = existingAssignments.find(
            ea => ea.jobPostingId === jobPostingId && ea.entityId === entityId
          );

          if (existingAssignment) {
            const jobPosting = existingJobPostings.find(jp => jp.id === jobPostingId);
            const entity = existingEntities.find(e => e.id === entityId);
            skippedAssignments.push({
              jobPostingId,
              entityId,
              jobPostingTitle: jobPosting?.title,
              entityName: entity?.name,
              reason: 'Assignment already exists'
            });
            continue;
          }

          assignmentsData.push({
            jobPostingId,
            entityId,
            statusId,
            assignedUserId,
            assignedById,
            priority,
            notes
          });
        }
      }

      // Create assignments
      const createdAssignments = await prisma.jobPostingAssignment.createMany({
        data: assignmentsData
      });

      // Get created assignments with details
      const assignmentsWithDetails = await prisma.jobPostingAssignment.findMany({
        where: {
          jobPostingId: { in: jobPostingIds },
          entityId: { in: entityIds },
          assignedById
        },
        include: {
          jobPosting: {
            select: { id: true, title: true }
          },
          entity: {
            select: { id: true, name: true }
          },
          assignedUser: {
            select: { id: true, firstName: true, lastName: true }
          },
          status: {
            select: { id: true, name: true }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      return {
        success: true,
        createdCount: createdAssignments.count,
        skippedCount: skippedAssignments.length,
        assignments: assignmentsWithDetails,
        skippedAssignments: skippedAssignments.length > 0 ? skippedAssignments : undefined
      };

    } catch (error) {
      throw new Error(`Bulk assignment failed: ${error.message}`);
    }
};

/**
 * Get job posting assignments
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Assignments with pagination
 */
const getJobPostingAssignments = async (filters = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        jobPostingId,
        entityId,
        assignedUserId,
        statusId,
        priority,
        sortBy = 'assignedAt',
        sortOrder = 'desc'
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = {};
      if (jobPostingId) where.jobPostingId = jobPostingId;
      if (entityId) where.entityId = entityId;
      if (assignedUserId) where.assignedUserId = assignedUserId;
      if (statusId) where.statusId = statusId;
      if (priority) where.priority = priority;

      // Get assignments with pagination
      const [assignments, totalCount] = await Promise.all([
        prisma.jobPostingAssignment.findMany({
          where,
          include: {
            jobPosting: {
              select: { id: true, title: true, company: { select: { name: true } } }
            },
            entity: {
              select: { id: true, name: true, type: true, location: true }
            },
            assignedUser: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            assignedBy: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            status: {
              select: { id: true, name: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.jobPostingAssignment.count({ where })
      ]);

      return {
        assignments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };

    } catch (error) {
      throw new Error(`Failed to get assignments: ${error.message}`);
    }
};

/**
 * Update job posting assignment
 * @param {string} assignmentId - Assignment ID
 * @param {Object} updateData - Update data
 * @param {string} modifiedById - User ID making the update
 * @returns {Promise<Object>} Updated assignment
 */
const updateJobPostingAssignment = async (assignmentId, updateData, modifiedById) => {
    try {
      // Check if assignment exists
      const existingAssignment = await prisma.jobPostingAssignment.findUnique({
        where: { id: assignmentId }
      });

      if (!existingAssignment) {
        throw new Error('Assignment not found');
      }

      // Update assignment
      const updatedAssignment = await prisma.jobPostingAssignment.update({
        where: { id: assignmentId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          jobPosting: {
            select: { id: true, title: true }
          },
          entity: {
            select: { id: true, name: true }
          },
          assignedUser: {
            select: { id: true, firstName: true, lastName: true }
          },
          status: {
            select: { id: true, name: true }
          }
        }
      });

      return updatedAssignment;

    } catch (error) {
      throw new Error(`Failed to update assignment: ${error.message}`);
    }
};

/**
 * Delete job posting assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteJobPostingAssignment = async (assignmentId) => {
    try {
      // Check if assignment exists
      const existingAssignment = await prisma.jobPostingAssignment.findUnique({
        where: { id: assignmentId }
      });

      if (!existingAssignment) {
        throw new Error('Assignment not found');
      }

      // Delete assignment
      await prisma.jobPostingAssignment.delete({
        where: { id: assignmentId }
      });

      return { success: true, message: 'Assignment deleted successfully' };

    } catch (error) {
      throw new Error(`Failed to delete assignment: ${error.message}`);
    }
};

/**
 * Create a single job posting assignment
 * @param {string} jobPostingId - Job posting ID
 * @param {string} entityId - Entity ID
 * @param {string} assignedById - User ID who is making the assignment
 * @param {string} assignedUserId - User ID being assigned (optional)
 * @param {string} statusId - Status ID
 * @param {string} priority - Priority level (default: 'normal')
 * @param {string} notes - Notes (optional)
 * @returns {Promise<Object>} Created assignment
 */
const createJobPostingAssignment = async (jobPostingId, entityId, assignedById, assignedUserId = null, statusId, priority = 'normal', notes = null) => {
  try {
    // Check if job posting exists
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId }
    });

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    // Check if entity exists
    const entity = await prisma.entity.findUnique({
      where: { id: entityId }
    });

    if (!entity) {
      throw new Error('Entity not found');
    }

    // Check if status exists
    const status = await prisma.jobStatus.findUnique({
      where: { id: statusId }
    });

    if (!status) {
      throw new Error('Status not found');
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.jobPostingAssignment.findFirst({
      where: {
        jobPostingId: jobPostingId,
        entityId: entityId
      }
    });

    if (existingAssignment) {
      throw new Error('Assignment already exists for this job posting and entity');
    }

    // Create the assignment
    const assignment = await prisma.jobPostingAssignment.create({
      data: {
        jobPostingId,
        entityId,
        assignedById,
        assignedUserId,
        statusId,
        priority,
        notes
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        entity: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        status: {
          select: {
            id: true,
            name: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return assignment;
  } catch (error) {
    console.error('Error creating job posting assignment:', error);
    throw error;
  }
};

module.exports = {
  getAllStatuses,
  getStatusById,
  createStatus,
  updateStatus,
  deleteStatus,
  getAllJobPostings,
  getJobPostingsByCompanyId,
  getJobPostingById,
  createJobPosting,
  bulkCreateJobPostings,
  updateJobPosting,
  deleteJobPosting,
  bulkDeleteJobPostings,
  getJobPostingStats,
  getCompanyJobPostingStats,
  getJobPostingsByCategory,
  getJobPostingsByStatus,
  searchJobPostings,
  getJobPostingsByValidation,
  updateJobPostingValidation,
  bulkValidateJobPostings,
  bulkUnvalidateJobPostings,
  bulkAssignJobPostingsToEntities,
  getJobPostingAssignments,
  updateJobPostingAssignment,
  deleteJobPostingAssignment,
  createJobPostingAssignment
};
