// src/services/job-posting-status.service.js
const prisma = require('../config/database');

/**
 * Get all job posting statuses with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Statuses with pagination info
 */
const getAllStatuses = async (options = {}) => {
    const {
      page = 1,
      limit = 50,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const skip = (page - 1) * limit;

    // Build filters
    const where = {};
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Build sort order
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [statuses, total] = await Promise.all([
      prisma.jobPostingStatus.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { jobPostings: true }
          }
        }
      }),
      prisma.jobPostingStatus.count({ where })
    ]);

    return {
      statuses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
};

/**
 * Get job posting status by ID
 * @param {string} id - Status ID
 * @returns {Promise<Object>} Status details
 */
const getStatusById = async (id) => {
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

    return status;
};

/**
 * Get job posting status by name
 * @param {string} name - Status name
 * @returns {Promise<Object>} Status details
 */
const getStatusByName = async (name) => {
    const status = await prisma.jobPostingStatus.findFirst({
      where: { name },
      include: {
        _count: {
          select: { jobPostings: true }
        }
      }
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

    const status = await prisma.jobPostingStatus.create({
      data: statusData,
      include: {
        _count: {
          select: { jobPostings: true }
        }
      }
    });

    return status;
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

    const status = await prisma.jobPostingStatus.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { jobPostings: true }
        }
      }
    });

    return status;
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
 * Toggle status active/inactive
 * @param {string} id - Status ID
 * @returns {Promise<Object>} Updated status
 */
const toggleStatus = async (id) => {
    const status = await prisma.jobPostingStatus.findUnique({
      where: { id }
    });

    if (!status) {
      throw new Error('Job posting status not found');
    }

    return await prisma.jobPostingStatus.update({
      where: { id },
      data: { isActive: !status.isActive },
      include: {
        _count: {
          select: { jobPostings: true }
        }
      }
    });
};

/**
 * Get status statistics
 * @returns {Promise<Object>} Status statistics
 */
const getStatusStats = async () => {
    const [totalStatuses, activeStatuses, inactiveStatuses] = await Promise.all([
      prisma.jobPostingStatus.count(),
      prisma.jobPostingStatus.count({ where: { isActive: true } }),
      prisma.jobPostingStatus.count({ where: { isActive: false } })
    ]);

    // Get status usage statistics
    const statusUsage = await prisma.jobPostingStatus.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        _count: {
          select: { jobPostings: true }
        }
      },
      orderBy: {
        jobPostings: {
          _count: 'desc'
        }
      }
    });

    return {
      total: totalStatuses,
      active: activeStatuses,
      inactive: inactiveStatuses,
      usage: statusUsage
    };
};

/**
 * Search statuses
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching statuses
 */
const searchStatuses = async (query) => {
    if (!query || query.length < 2) {
      return [];
    }

    return await prisma.jobPostingStatus.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: { jobPostings: true }
        }
      },
      orderBy: { name: 'asc' }
    });
};

module.exports = {
  getAllStatuses,
  getStatusById,
  getStatusByName,
  createStatus,
  updateStatus,
  deleteStatus,
  toggleStatus,
  getStatusStats,
  searchStatuses
};
