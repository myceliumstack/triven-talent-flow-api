const { PrismaClient } = require('@prisma/client');
const { generateJobCode } = require('../utils/job-code.utils');

const prisma = new PrismaClient();

const createJob = async (data) => {
  try {
    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      let jobCode;
      
      // If jobPostingId is provided, check if posting exists and handle job code
      if (data.jobPostingId) {
        const jobPosting = await tx.jobPosting.findUnique({
          where: { id: data.jobPostingId },
          select: { id: true, jobCode: true, title: true }
        });

        if (!jobPosting) {
          throw new Error('Job posting not found');
        }

        // If posting already has a job code, use it; otherwise generate new one
        if (jobPosting.jobCode) {
          jobCode = jobPosting.jobCode;
        } else {
          // Generate new job code and update the posting
          jobCode = generateJobCode();
          await tx.jobPosting.update({
            where: { id: data.jobPostingId },
            data: { jobCode: jobCode }
          });
        }
      } else {
        // No job posting, generate new job code
        jobCode = generateJobCode();
      }
      
      const job = await tx.job.create({
        data: {
          jobCode,
          title: data.title,
          description: data.description,
          location: data.location,
          remoteType: data.remoteType,
          timeZone: data.timeZone,
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
          salaryCurrency: data.salaryCurrency,
          salaryNotes: data.salaryNotes,
          feePercentage: data.feePercentage,
          paymentTerms: data.paymentTerms,
          relocationAssistance: data.relocationAssistance,
          relocationDetails: data.relocationDetails,
          warrantyType: data.warrantyType,
          warrantyPeriodDays: data.warrantyPeriodDays,
          skillsMatrix: data.skills || null,
          booleanSearch: data.booleanSearch,
          tags: data.tags || [],
          companyId: data.companyId,
          jobPostingId: data.jobPostingId,
          createdById: data.createdById,
          modifiedById: data.modifiedById,
          isActive: data.isActive !== undefined ? data.isActive : true,
          postingMeta: data.postingMeta || null,
          candidateCount: data.candidateCount || 0,
          notes: data.notes
        },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        createdBy: {
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
        }
      }
      });

      return job;
    });

    return result;
  } catch (error) {
    throw new Error(`Error creating job: ${error.message}`);
  }
};

const getAllJobs = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    
    if (filters.jobPostingId) {
      where.jobPostingId = filters.jobPostingId;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { jobCode: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    if (filters.remoteType) {
      where.remoteType = filters.remoteType;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
              location: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: { jobAssignments: true }
          }
        }
      }),
      prisma.job.count({ where })
    ]);

    // Add isAssigned flag without returning assignment details
    const jobsWithAssignmentFlag = jobs.map((job) => {
      const { _count, ...rest } = job;
      return {
        ...rest,
        isAssigned: !!(_count && _count.jobAssignments > 0)
      };
    });

    return {
      jobs: jobsWithAssignmentFlag,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error fetching jobs: ${error.message}`);
  }
};

const getJobById = async (id) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
            website: true
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            category: true,
            experienceRange: true,
            salaryRange: true
          }
        },
        createdBy: {
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
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        candidates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            currentStage: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            createdAt: true
          }
        }
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  } catch (error) {
    throw new Error(`Error fetching job: ${error.message}`);
  }
};

const getJobByCode = async (jobCode) => {
  try {
    const job = await prisma.job.findUnique({
      where: { jobCode },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
            website: true
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            category: true,
            experienceRange: true,
            salaryRange: true
          }
        },
        jobAssignments: {
          include: {
            status: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        createdBy: {
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
        jobActivities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        jobCandidateAssignments: {
          take: 10,
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  } catch (error) {
    throw new Error(`Error fetching job by code: ${error.message}`);
  }
};

// Partial search by jobCode (case-insensitive contains)
const searchJobsByCode = async (jobCodePart, filters = {}) => {
  try {
    const where = {
      jobCode: { contains: jobCodePart, mode: 'insensitive' }
    };
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, jobCode: true }
      }),
      prisma.job.count({ where })
    ]);

    return {
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  } catch (error) {
    throw new Error(`Error searching jobs: ${error.message}`);
  }
};

const updateJob = async (id, data) => {
  try {
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });

    if (!existingJob) {
      throw new Error('Job not found');
    }

    // Build update data object with only provided fields
    const updateData = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.remoteType !== undefined) updateData.remoteType = data.remoteType;
    if (data.timeZone !== undefined) updateData.timeZone = data.timeZone;
    if (data.minSalary !== undefined) updateData.minSalary = data.minSalary;
    if (data.maxSalary !== undefined) updateData.maxSalary = data.maxSalary;
    if (data.salaryCurrency !== undefined) updateData.salaryCurrency = data.salaryCurrency;
    if (data.salaryNotes !== undefined) updateData.salaryNotes = data.salaryNotes;
    if (data.feePercentage !== undefined) updateData.feePercentage = data.feePercentage;
    if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
    if (data.relocationAssistance !== undefined) updateData.relocationAssistance = data.relocationAssistance;
    if (data.relocationDetails !== undefined) updateData.relocationDetails = data.relocationDetails;
    if (data.warrantyType !== undefined) updateData.warrantyType = data.warrantyType;
    if (data.warrantyPeriodDays !== undefined) updateData.warrantyPeriodDays = data.warrantyPeriodDays;
    if (data.skills !== undefined) updateData.skills = data.skills || null;
    if (data.booleanSearch !== undefined) updateData.booleanSearch = data.booleanSearch;
    if (data.tags !== undefined) updateData.tags = data.tags || [];
    if (data.companyId !== undefined) updateData.companyId = data.companyId;
    if (data.jobPostingId !== undefined) updateData.jobPostingId = data.jobPostingId;
    if (data.modifiedById !== undefined) updateData.modifiedById = data.modifiedById;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.postingMeta !== undefined) updateData.postingMeta = data.postingMeta || null;
    if (data.candidateCount !== undefined) updateData.candidateCount = data.candidateCount;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true
          }
        },
        createdBy: {
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
        }
      }
    });

    return job;
  } catch (error) {
    throw new Error(`Error updating job: ${error.message}`);
  }
};

const deleteJob = async (id) => {
  try {
    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First check if job exists and get its details
      const existingJob = await tx.job.findUnique({
        where: { id },
        select: { 
          id: true, 
          jobCode: true, 
          jobPostingId: true 
        }
      });

      if (!existingJob) {
        throw new Error('Job not found');
      }

      // Check if job has candidates
      const candidateCount = await tx.candidate.count({
        where: { jobId: id }
      });

      if (candidateCount > 0) {
        throw new Error('Cannot delete job that has associated candidates');
      }

      // If job is linked to a posting, clear the job code from the posting
      if (existingJob.jobPostingId) {
        await tx.jobPosting.update({
          where: { id: existingJob.jobPostingId },
          data: { jobCode: null }
        });
      }

      // Delete the job
      await tx.job.delete({
        where: { id }
      });

      return { 
        message: 'Job deleted successfully',
        clearedJobCode: existingJob.jobCode,
        clearedFromPosting: existingJob.jobPostingId ? true : false
      };
    });

    return result;
  } catch (error) {
    throw new Error(`Error deleting job: ${error.message}`);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getJobByCode,
  searchJobsByCode,
  updateJob,
  deleteJob
};
