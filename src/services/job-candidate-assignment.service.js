const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a job candidate assignment
 * @param {Object} data - Assignment data
 * @returns {Promise<Object>} Created assignment
 */
const createJobCandidateAssignment = async (data) => {
  try {
    // Resolve default stage to 'new-application' (fallback by name 'New Application')
    let stage = await prisma.candidateStage.findFirst({ where: { slug: 'new-application' } });
    if (!stage) {
      stage = await prisma.candidateStage.findFirst({ where: { name: 'New Application' } });
    }
    if (!stage) {
      throw new Error('Default candidate stage "New Application" not found');
    }

    const assignment = await prisma.jobCandidateAssignment.create({
      data: {
        jobId: data.jobId,
        candidateId: data.candidateId,
        stageId: stage.id,
        status: data.status || 'active',
        priority: data.priority || 'normal',
        source: data.source,
        referralSource: data.referralSource,
        applicationDate: data.applicationDate,
        notes: data.notes,
        assignedById: data.assignedById,
        isActive: data.isActive !== undefined ? data.isActive : true
      },
      include: {
        job: {
          select: {
            id: true,
            jobCode: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        stage: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        assignedBy: {
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
    throw new Error(`Error creating job candidate assignment: ${error.message}`);
  }
};

/**
 * Get all job candidate assignments with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Assignments with pagination
 */
const getAllJobCandidateAssignments = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.jobId) {
      where.jobId = filters.jobId;
    }
    
    if (filters.candidateId) {
      where.candidateId = filters.candidateId;
    }
    
    if (filters.stageId) {
      where.stageId = filters.stageId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      prisma.jobCandidateAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedDate: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              jobCode: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              location: true
            }
          },
          stage: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.jobCandidateAssignment.count({ where })
    ]);

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error fetching job candidate assignments: ${error.message}`);
  }
};

/**
 * Get job candidate assignment by ID
 * @param {string} id - Assignment ID
 * @returns {Promise<Object>} Assignment details
 */
const getJobCandidateAssignmentById = async (id) => {
  try {
    const assignment = await prisma.jobCandidateAssignment.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            jobCode: true,
            title: true,
            description: true,
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
                location: true
              }
            }
          }
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            skills: true,
            experienceYears: true,
            expectedSalary: true,
            resumeUrl: true,
            linkedinUrl: true
          }
        },
        stage: {
          select: {
            id: true,
            name: true,
            slug: true
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
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        candidateActivities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      throw new Error('Job candidate assignment not found');
    }

    return assignment;
  } catch (error) {
    throw new Error(`Error fetching job candidate assignment: ${error.message}`);
  }
};

/**
 * Update job candidate assignment
 * @param {string} id - Assignment ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated assignment
 */
const updateJobCandidateAssignment = async (id, data) => {
  try {
    const existingAssignment = await prisma.jobCandidateAssignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      throw new Error('Job candidate assignment not found');
    }

    const assignment = await prisma.jobCandidateAssignment.update({
      where: { id },
      data: {
        stageId: data.stageId,
        status: data.status,
        priority: data.priority,
        source: data.source,
        referralSource: data.referralSource,
        applicationDate: data.applicationDate,
        notes: data.notes,
        modifiedById: data.modifiedById,
        isActive: data.isActive,
        lastActivityDate: new Date()
      },
      include: {
        job: {
          select: {
            id: true,
            jobCode: true,
            title: true
          }
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        stage: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return assignment;
  } catch (error) {
    throw new Error(`Error updating job candidate assignment: ${error.message}`);
  }
};

/**
 * Update stageId for a job candidate assignment
 * @param {string} id - Assignment ID
 * @param {string} stageId - New stage ID
 * @param {string} modifiedById - User ID who made the change
 * @returns {Promise<Object>} Updated assignment
 */
const updateStageId = async (id, stageId, modifiedById) => {
  try {
    // Verify assignment exists
    const existingAssignment = await prisma.jobCandidateAssignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      throw new Error('Job candidate assignment not found');
    }

    // Verify stage exists
    const stage = await prisma.candidateStage.findUnique({
      where: { id: stageId }
    });

    if (!stage) {
      throw new Error('Candidate stage not found');
    }

    // Update only stageId
    const assignment = await prisma.jobCandidateAssignment.update({
      where: { id },
      data: {
        stageId: stageId,
        modifiedById: modifiedById,
        lastActivityDate: new Date()
      },
      include: {
        job: {
          select: {
            id: true,
            jobCode: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        stage: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        modifiedBy: {
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
    if (error.message === 'Job candidate assignment not found' || error.message === 'Candidate stage not found') {
      throw error;
    }
    throw new Error(`Error updating stage ID: ${error.message}`);
  }
};

/**
 * Delete job candidate assignment
 * @param {string} id - Assignment ID
 * @returns {Promise<void>}
 */
const deleteJobCandidateAssignment = async (id) => {
  try {
    const existingAssignment = await prisma.jobCandidateAssignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      throw new Error('Job candidate assignment not found');
    }

    await prisma.jobCandidateAssignment.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(`Error deleting job candidate assignment: ${error.message}`);
  }
};

module.exports = {
  createJobCandidateAssignment,
  getAllJobCandidateAssignments,
  getJobCandidateAssignmentById,
  updateJobCandidateAssignment,
  deleteJobCandidateAssignment,
  updateStageId
};

