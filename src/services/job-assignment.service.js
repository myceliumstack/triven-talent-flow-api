const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class JobAssignmentService {
  // Create a new job assignment
  async createJobAssignment(data) {
    try {
      // Always use Open status for new job assignments
      let openStatus = await prisma.jobStatus.findFirst({ where: { slug: 'open' } });
      if (!openStatus) {
        openStatus = await prisma.jobStatus.findFirst({ where: { name: 'Open' } });
      }
      if (!openStatus) {
        throw new Error('Default Open job status not found');
      }

      const jobAssignment = await prisma.jobAssignment.create({
        data: {
          jobId: data.jobId,
          assignedUserId: data.assignedUserId,
          statusId: openStatus.id,
          assignedById: data.assignedById,
          priority: data.priority || 'normal',
          notes: data.notes,
        },
        include: {
          job: {
            select: {
              id: true,
              jobCode: true,
              title: true,
              description: true,
              location: true,
              remoteType: true,
              timeZone: true,
              minSalary: true,
              maxSalary: true,
              salaryCurrency: true,
              salaryNotes: true,
              feePercentage: true,
              paymentTerms: true,
              relocationAssistance: true,
              relocationDetails: true,
              warrantyType: true,
              warrantyPeriodDays: true,
              skillsMatrix: true,
              booleanSearch: true,
              tags: true,
              companyId: true,
              jobPostingId: true,
              createdById: true,
              modifiedById: true,
              isActive: true,
              postingMeta: true,
              candidateCount: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  industry: true,
                  location: true,
                  website: true,
                },
              },
              jobPosting: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  experienceRange: true,
                  salaryRange: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              modifiedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              jobActivities: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                  createdBy: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
              jobCandidateAssignments: {
                take: 10,
                include: {
                  candidate: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                  },
                },
              },
            },
          },
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return {
        success: true,
        data: jobAssignment,
        message: 'Job assignment created successfully',
      };
    } catch (error) {
      console.error('Error creating job assignment:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create job assignment',
      };
    }
  }

  // Get all job assignments with pagination and filters
  async getAllJobAssignments(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        jobId,
        assignedUserId,
        statusId,
        assignedById,
        priority,
        search,
        sortBy = 'assignedAt',
        sortOrder = 'desc',
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      // Build where clause based on filters
      if (jobId) where.jobId = jobId;
      if (assignedUserId) where.assignedUserId = assignedUserId;
      if (statusId) where.statusId = statusId;
      if (assignedById) where.assignedById = assignedById;
      if (priority) where.priority = priority;

      // Search functionality
      if (search) {
        where.OR = [
          {
            job: {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            assignedUser: {
              OR: [
                {
                  firstName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
          {
            notes: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      const [jobAssignments, total] = await Promise.all([
        prisma.jobAssignment.findMany({
          where,
          include: {
            job: {
              select: {
                id: true,
                jobCode: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            assignedUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            status: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
        }),
        prisma.jobAssignment.count({ where }),
      ]);

      return {
        success: true,
        data: jobAssignments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        message: 'Job assignments retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting job assignments:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve job assignments',
      };
    }
  }

  // Get job assignment by ID
  async getJobAssignmentById(id) {
    try {
      const jobAssignment = await prisma.jobAssignment.findUnique({
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
                },
              },
            },
          },
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!jobAssignment) {
        return {
          success: false,
          message: 'Job assignment not found',
        };
      }

      return {
        success: true,
        data: jobAssignment,
        message: 'Job assignment retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting job assignment:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve job assignment',
      };
    }
  }

  // Update job assignment
  async updateJobAssignment(id, data) {
    try {
      // Check if job assignment exists
      const existingAssignment = await prisma.jobAssignment.findUnique({
        where: { id },
      });

      if (!existingAssignment) {
        return {
          success: false,
          message: 'Job assignment not found',
        };
      }

      const updateData = {};
      if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
      if (data.statusId !== undefined) updateData.statusId = data.statusId;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const jobAssignment = await prisma.jobAssignment.update({
        where: { id },
        data: updateData,
        include: {
          job: {
            select: {
              id: true,
              jobCode: true,
              title: true,
              description: true,
              location: true,
              remoteType: true,
              timeZone: true,
              minSalary: true,
              maxSalary: true,
              salaryCurrency: true,
              salaryNotes: true,
              feePercentage: true,
              paymentTerms: true,
              relocationAssistance: true,
              relocationDetails: true,
              warrantyType: true,
              warrantyPeriodDays: true,
              skillsMatrix: true,
              booleanSearch: true,
              tags: true,
              companyId: true,
              jobPostingId: true,
              createdById: true,
              modifiedById: true,
              isActive: true,
              postingMeta: true,
              candidateCount: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  industry: true,
                  location: true,
                  website: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              modifiedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              }
            },
          },
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return {
        success: true,
        data: jobAssignment,
        message: 'Job assignment updated successfully',
      };
    } catch (error) {
      console.error('Error updating job assignment:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update job assignment',
      };
    }
  }

  // Delete job assignment
  async deleteJobAssignment(id) {
    try {
      // Check if job assignment exists
      const existingAssignment = await prisma.jobAssignment.findUnique({
        where: { id },
      });

      if (!existingAssignment) {
        return {
          success: false,
          message: 'Job assignment not found',
        };
      }

      await prisma.jobAssignment.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Job assignment deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting job assignment:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete job assignment',
      };
    }
  }

  // Get job assignments by job ID
  async getJobAssignmentsByJobId(jobId) {
    try {
      const jobAssignments = await prisma.jobAssignment.findMany({
        where: { jobId },
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
      });

      return {
        success: true,
        data: jobAssignments,
        message: 'Job assignments retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting job assignments by job ID:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve job assignments',
      };
    }
  }

  // Get job assignments by user ID
  async getJobAssignmentsByUserId(userId) {
    try {
      const jobAssignments = await prisma.jobAssignment.findMany({
        where: { assignedUserId: userId },
        include: {
          job: {
            select: {
              id: true,
              jobCode: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
      });

      return {
        success: true,
        data: jobAssignments,
        message: 'Job assignments retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting job assignments by user ID:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve job assignments',
      };
    }
  }
}

module.exports = new JobAssignmentService();

