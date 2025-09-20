const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createJobStatus = async (data) => {
  try {
    const jobStatus = await prisma.jobStatus.create({
      data: {
        name: data.name,
        slug: data.slug,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
    return jobStatus;
  } catch (error) {
    throw new Error(`Error creating job status: ${error.message}`);
  }
};

const getAllJobStatuses = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const jobStatuses = await prisma.jobStatus.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return jobStatuses;
  } catch (error) {
    throw new Error(`Error fetching job statuses: ${error.message}`);
  }
};

const getJobStatusById = async (id) => {
  try {
    const jobStatus = await prisma.jobStatus.findUnique({
      where: { id },
      include: {
        jobs: {
          select: {
            id: true,
            jobCode: true,
            title: true,
            createdAt: true
          }
        }
      }
    });

    if (!jobStatus) {
      throw new Error('Job status not found');
    }

    return jobStatus;
  } catch (error) {
    throw new Error(`Error fetching job status: ${error.message}`);
  }
};

const updateJobStatus = async (id, data) => {
  try {
    const existingJobStatus = await prisma.jobStatus.findUnique({
      where: { id }
    });

    if (!existingJobStatus) {
      throw new Error('Job status not found');
    }

    const jobStatus = await prisma.jobStatus.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        isActive: data.isActive
      }
    });

    return jobStatus;
  } catch (error) {
    throw new Error(`Error updating job status: ${error.message}`);
  }
};

const deleteJobStatus = async (id) => {
  try {
    const existingJobStatus = await prisma.jobStatus.findUnique({
      where: { id },
      include: {
        jobs: true
      }
    });

    if (!existingJobStatus) {
      throw new Error('Job status not found');
    }

    if (existingJobStatus.jobs.length > 0) {
      throw new Error('Cannot delete job status that has associated jobs');
    }

    await prisma.jobStatus.delete({
      where: { id }
    });

    return { message: 'Job status deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting job status: ${error.message}`);
  }
};

module.exports = {
  createJobStatus,
  getAllJobStatuses,
  getJobStatusById,
  updateJobStatus,
  deleteJobStatus
};
