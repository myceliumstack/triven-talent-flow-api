// src/services/job-posting-assignment.service.js
const prisma = require('../config/database');

/**
 * Get all job posting assignments with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Assignments with pagination
 */
const getJobPostingAssignments = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      filters = {},
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    // Assigned user filter
    if (filters.assignedUserId) where.assignedUserId = filters.assignedUserId;
    
    // Build AND conditions for specific field filters
    const andConditions = [];
    
    // Job title filter
    if (filters.jobTitle) {
      if (Array.isArray(filters.jobTitle) && filters.jobTitle.length > 1) {
        // Multiple values: use OR logic
        andConditions.push({
          OR: filters.jobTitle.map(value => ({
            jobPosting: {
              title: { contains: value, mode: 'insensitive' }
            }
          }))
        });
      } else {
        // Single value
        const value = Array.isArray(filters.jobTitle) ? filters.jobTitle[0] : filters.jobTitle;
        andConditions.push({
          jobPosting: {
            title: { contains: value, mode: 'insensitive' }
          }
        });
      }
    }
    
    // Company name filter
    if (filters.company) {
      if (Array.isArray(filters.company) && filters.company.length > 1) {
        // Multiple values: use OR logic
        andConditions.push({
          OR: filters.company.map(value => ({
            jobPosting: {
              company: {
                name: { contains: value, mode: 'insensitive' }
              }
            }
          }))
        });
      } else {
        // Single value
        const value = Array.isArray(filters.company) ? filters.company[0] : filters.company;
        andConditions.push({
          jobPosting: {
            company: {
              name: { contains: value, mode: 'insensitive' }
            }
          }
        });
      }
    }
    
    // Category filter
    if (filters.category) {
      if (Array.isArray(filters.category) && filters.category.length > 1) {
        // Multiple values: use OR logic
        andConditions.push({
          OR: filters.category.map(value => ({
            jobPosting: {
              category: { contains: value, mode: 'insensitive' }
            }
          }))
        });
      } else {
        // Single value
        const value = Array.isArray(filters.category) ? filters.category[0] : filters.category;
        andConditions.push({
          jobPosting: {
            category: { contains: value, mode: 'insensitive' }
          }
        });
      }
    }
    
    // Location filter
    if (filters.location) {
      if (Array.isArray(filters.location) && filters.location.length > 1) {
        // Multiple values: use OR logic
        andConditions.push({
          OR: filters.location.map(value => ({
            jobPosting: {
              location: { contains: value, mode: 'insensitive' }
            }
          }))
        });
      } else {
        // Single value
        const value = Array.isArray(filters.location) ? filters.location[0] : filters.location;
        andConditions.push({
          jobPosting: {
            location: { contains: value, mode: 'insensitive' }
          }
        });
      }
    }
    
    // Status filter
    if (filters.status) {
      if (Array.isArray(filters.status) && filters.status.length > 1) {
        // Multiple values: use OR logic
        andConditions.push({
          OR: filters.status.map(value => ({
            status: {
              name: { contains: value, mode: 'insensitive' }
            }
          }))
        });
      } else {
        // Single value
        const value = Array.isArray(filters.status) ? filters.status[0] : filters.status;
        andConditions.push({
          status: {
            name: { contains: value, mode: 'insensitive' }
          }
        });
      }
    }
    
    // Search filter - searches across multiple related fields
    if (filters.search) {
      const searchTerm = filters.search;
      const searchConditions = [
        { 
          jobPosting: { 
            title: { contains: searchTerm, mode: 'insensitive' } 
          } 
        },
        { 
          jobPosting: { 
            description: { contains: searchTerm, mode: 'insensitive' } 
          } 
        },
        { 
          jobPosting: { 
            location: { contains: searchTerm, mode: 'insensitive' } 
          } 
        },
        { 
          jobPosting: { 
            company: { 
              name: { contains: searchTerm, mode: 'insensitive' } 
            } 
          } 
        },
        { 
          entity: { 
            name: { contains: searchTerm, mode: 'insensitive' } 
          } 
        },
        { 
          status: { 
            name: { contains: searchTerm, mode: 'insensitive' } 
          } 
        },
        { 
          assignedUser: { 
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
          } 
        },
        { 
          assignedBy: { 
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
          } 
        },
        { 
          notes: { contains: searchTerm, mode: 'insensitive' } 
        }
      ];
      
      // Add search conditions to AND array if specific filters exist, otherwise use OR
      if (andConditions.length > 0) {
        andConditions.push({ OR: searchConditions });
      } else {
        where.OR = searchConditions;
      }
    }
    
    // Apply AND conditions if any specific filters are present
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [assignments, total] = await Promise.all([
      prisma.jobPostingAssignment.findMany({
        where,
        include: {
          jobPosting: {
            include: {
              company: true
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
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.jobPostingAssignment.count({ where })
    ]);

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getJobPostingAssignments:', error);
    throw new Error('Failed to fetch job posting assignments');
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

    // Update assignment field to true for the job posting
    await prisma.jobPosting.update({
      where: { id: jobPostingId },
      data: { assignment: true }
    });

    return assignment;
  } catch (error) {
    console.error('Error creating job posting assignment:', error);
    throw error;
  }
};

/**
 * Update a job posting assignment
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

    // Update the assignment
    const assignment = await prisma.jobPostingAssignment.update({
      where: { id: assignmentId },
      data: {
        ...updateData,
        updatedAt: new Date()
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
    console.error('Error updating job posting assignment:', error);
    throw error;
  }
};

/**
 * Delete a job posting assignment
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

    const jobPostingId = existingAssignment.jobPostingId;

    // Delete assignment
    await prisma.jobPostingAssignment.delete({
      where: { id: assignmentId }
    });

    // Check if there are any remaining assignments for this job posting
    const remainingAssignments = await prisma.jobPostingAssignment.count({
      where: { jobPostingId }
    });

    // If no assignments remain, set assignment field to false
    if (remainingAssignments === 0) {
      await prisma.jobPosting.update({
        where: { id: jobPostingId },
        data: { assignment: false }
      });
    }

    return { success: true, message: 'Assignment deleted successfully' };
  } catch (error) {
    console.error('Error deleting job posting assignment:', error);
    throw error;
  }
};

/**
 * Bulk assign job postings to entities
 * @param {Array} jobPostingIds - Array of job posting IDs
 * @param {Array} entityIds - Array of entity IDs
 * @param {string} assignedById - User ID making the assignment
 * @param {string} assignedUserId - User ID being assigned (optional)
 * @param {string} statusId - Status ID
 * @param {string} priority - Priority level (default: 'normal')
 * @param {string} notes - Notes (optional)
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

    // Validate status exists
    const status = await prisma.jobStatus.findUnique({
      where: { id: statusId }
    });

    if (!status) {
      throw new Error('Status not found');
    }

    // Create assignments data (cartesian product)
    const assignmentsData = [];
    for (const jobPostingId of jobPostingIds) {
      for (const entityId of entityIds) {
        assignmentsData.push({
          jobPostingId,
          entityId,
          assignedById,
          assignedUserId,
          statusId,
          priority,
          notes
        });
      }
    }

    // Use database transaction for better performance and error handling
    const result = await prisma.$transaction(async (tx) => {
      let createdCount = 0;
      let skippedCount = 0;
      const createdAssignments = [];

      for (const assignmentData of assignmentsData) {
        try {
          const assignment = await tx.jobPostingAssignment.create({
            data: assignmentData
          });
          createdAssignments.push(assignment);
          createdCount++;
        } catch (error) {
          if (error.code === 'P2002') {
            // Unique constraint violation - assignment already exists
            skippedCount++;
          } else {
            throw error;
          }
        }
      }

      return {
        createdCount,
        skippedCount,
        createdAssignments
      };
    });

    // Update assignment field to true for all job postings that got assignments
    const uniqueJobPostingIds = [...new Set(assignmentsData.map(a => a.jobPostingId))];
    await prisma.jobPosting.updateMany({
      where: {
        id: { in: uniqueJobPostingIds }
      },
      data: {
        assignment: true
      }
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

    return {
      success: true,
      message: 'Job postings assigned successfully',
      data: {
        createdCount: result.createdCount,
        skippedCount: result.skippedCount,
        assignments: result.createdAssignments
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in bulkAssignJobPostingsToEntities:', error);
    throw error;
  }
};

/**
 * Get entities for assignment
 * @returns {Promise<Array>} List of entities
 */
const getEntitiesForAssignment = async () => {
  try {
    const entities = await prisma.entity.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    return entities;
  } catch (error) {
    console.error('Error fetching entities:', error);
    throw new Error('Failed to fetch entities');
  }
};

/**
 * Get job posting statuses for assignment
 * @returns {Promise<Array>} List of statuses
 */
const getJobPostingStatusesForAssignment = async () => {
  try {
    const statuses = await prisma.jobStatus.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    return statuses;
  } catch (error) {
    console.error('Error fetching job posting statuses:', error);
    throw new Error('Failed to fetch job posting statuses');
  }
};

/**
 * Get assignment status for multiple job postings
 * @param {Array} jobPostingIds - Array of job posting IDs
 * @returns {Promise<Object>} Assignment status for each job posting
 */
const getJobPostingAssignmentStatus = async (jobPostingIds) => {
  try {
    // Query the database for assignments
    const assignments = await prisma.jobPostingAssignment.findMany({
      where: {
        jobPostingId: { in: jobPostingIds }
      },
      include: {
        assignedUser: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true,
            email: true 
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
        }
      }
    });

    // Initialize all postings as unassigned
    const status = {};
    jobPostingIds.forEach(id => {
      status[id] = { isAssigned: false };
    });

    // Group assignments by job posting ID
    const groupedAssignments = {};
    assignments.forEach(assignment => {
      if (!groupedAssignments[assignment.jobPostingId]) {
        groupedAssignments[assignment.jobPostingId] = [];
      }
      groupedAssignments[assignment.jobPostingId].push({
        assignedTo: assignment.assignedUserId,
        assignedToName: `${assignment.assignedUser.firstName} ${assignment.assignedUser.lastName}`,
        assignedToEmail: assignment.assignedUser.email,
        entityName: assignment.entity.name,
        entityType: assignment.entity.type,
        statusName: assignment.status.name,
        assignmentId: assignment.id,
        assignedAt: assignment.assignedAt,
        priority: assignment.priority,
        notes: assignment.notes
      });
    });

    // Update status with grouped assignments
    Object.keys(groupedAssignments).forEach(jobPostingId => {
      status[jobPostingId] = {
        isAssigned: true,
        assignees: groupedAssignments[jobPostingId]
      };
    });

    return status;
  } catch (error) {
    console.error('Error fetching job posting assignment status:', error);
    throw new Error('Failed to fetch assignment status');
  }
};

/**
 * Get job posting assignments by status ID and user ID
 * @param {string} statusId - Status ID
 * @param {string} userId - User ID to filter assignments
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Assignments with pagination
 */
const getJobPostingAssignmentsByStatus = async (statusId, userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Build where clause to filter by both statusId and userId
    const where = {
      statusId,
      assignedUserId: userId
    };

    const [assignments, total] = await Promise.all([
      prisma.jobPostingAssignment.findMany({
        where,
        include: {
          jobPosting: {
            include: {
              company: true
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
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.jobPostingAssignment.count({ 
        where 
      })
    ]);

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getJobPostingAssignmentsByStatus:', error);
    throw new Error('Failed to fetch job posting assignments by status');
  }
};

/**
 * Search job posting assignments for a specific user
 * @param {string} query - Search query
 * @param {string} userId - User ID to filter assignments
 * @returns {Promise<Array>} Matching job posting assignments
 */
const searchJobPostingAssignments = async (query, userId) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const assignments = await prisma.jobPostingAssignment.findMany({
      where: {
        assignedUserId: userId,
        OR: [
          { 
            jobPosting: { 
              title: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            jobPosting: { 
              description: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            jobPosting: { 
              location: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            jobPosting: { 
              company: { 
                name: { contains: query, mode: 'insensitive' } 
              } 
            } 
          },
          { 
            entity: { 
              name: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            status: { 
              name: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            assignedUser: { 
              firstName: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            assignedUser: { 
              lastName: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            assignedUser: { 
              email: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            assignedBy: { 
              firstName: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            assignedBy: { 
              lastName: { contains: query, mode: 'insensitive' } 
            } 
          },
          { 
            notes: { contains: query, mode: 'insensitive' } 
          }
        ]
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            location: true,
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
      },
      take: 20,
      orderBy: { assignedAt: 'desc' }
    });

    return assignments;
  } catch (error) {
    console.error('Error in searchJobPostingAssignments:', error);
    throw new Error('Failed to search job posting assignments');
  }
};

module.exports = {
  getJobPostingAssignments,
  createJobPostingAssignment,
  updateJobPostingAssignment,
  deleteJobPostingAssignment,
  bulkAssignJobPostingsToEntities,
  getEntitiesForAssignment,
  getJobPostingStatusesForAssignment,
  getJobPostingAssignmentStatus,
  getJobPostingAssignmentsByStatus,
  searchJobPostingAssignments
};
