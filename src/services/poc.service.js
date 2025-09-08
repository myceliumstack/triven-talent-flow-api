// src/services/poc.service.js
const prisma = require('../config/database');

class POCService {
  /**
   * Get all POCs with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} POCs with pagination info
   */
  async getAllPOCs(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      companyId,
      designation,
      department
    } = options;

    const skip = (page - 1) * limit;

    // Build filters
    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (companyId) where.companyId = companyId;
    if (designation) where.designation = designation;
    if (department) where.department = department;

    const [pocs, total] = await Promise.all([
      prisma.pOC.findMany({
        where,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        skip,
        take: limit,
        include: {
          company: {
            select: { id: true, name: true, industry: true }
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          modifiedBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      }),
      prisma.pOC.count({ where })
    ]);

    return {
      pocs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get POCs by company ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} POCs for the company
   */
  async getPOCsByCompanyId(companyId) {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return await prisma.pOC.findMany({
      where: { companyId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  /**
   * Get POC by ID
   * @param {string} id - POC ID
   * @returns {Promise<Object>} POC details
   */
  async getPOCById(id) {
    const poc = await prisma.pOC.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!poc) {
      throw new Error('POC not found');
    }

    return poc;
  }

  /**
   * Create new POC
   * @param {Object} pocData - POC data
   * @param {string} createdById - User ID who created the POC
   * @returns {Promise<Object>} Created POC
   */
  async createPOC(pocData, createdById) {
    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: pocData.companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Check if POC with same email already exists
    const existingPOC = await prisma.pOC.findUnique({
      where: { email: pocData.email }
    });

    if (existingPOC) {
      throw new Error('POC with this email already exists');
    }

    const poc = await prisma.pOC.create({
      data: {
        ...pocData,
        createdById
      },
      include: {
        company: {
          select: { id: true, name: true, industry: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return poc;
  }

  /**
   * Update POC
   * @param {string} id - POC ID
   * @param {Object} updateData - Update data
   * @param {string} modifiedById - User ID who modified the POC
   * @returns {Promise<Object>} Updated POC
   */
  async updatePOC(id, updateData, modifiedById) {
    // Check if POC exists
    const existingPOC = await prisma.pOC.findUnique({
      where: { id }
    });

    if (!existingPOC) {
      throw new Error('POC not found');
    }

    // Check for email conflict if email is being updated
    if (updateData.email && updateData.email !== existingPOC.email) {
      const emailConflict = await prisma.pOC.findUnique({
        where: { email: updateData.email }
      });

      if (emailConflict) {
        throw new Error('POC with this email already exists');
      }
    }

    const poc = await prisma.pOC.update({
      where: { id },
      data: {
        ...updateData,
        modifiedById
      },
      include: {
        company: {
          select: { id: true, name: true, industry: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return poc;
  }

  /**
   * Delete POC
   * @param {string} id - POC ID
   * @returns {Promise<boolean>} Success status
   */
  async deletePOC(id) {
    const poc = await prisma.pOC.findUnique({
      where: { id }
    });

    if (!poc) {
      throw new Error('POC not found');
    }

    await prisma.pOC.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Get POCs by designation
   * @param {string} designation - POC designation
   * @returns {Promise<Array>} POCs with the designation
   */
  async getPOCsByDesignation(designation) {
    return await prisma.pOC.findMany({
      where: { designation },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        }
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });
  }

  /**
   * Get POCs by department
   * @param {string} department - POC department
   * @returns {Promise<Array>} POCs in the department
   */
  async getPOCsByDepartment(department) {
    return await prisma.pOC.findMany({
      where: { department },
      include: {
        company: {
          select: { id: true, name: true, industry: true, location: true }
        }
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });
  }

  /**
   * Search POCs
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching POCs
   */
  async searchPOCs(query) {
    if (!query || query.length < 2) {
      return [];
    }

    return await prisma.pOC.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { designation: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        designation: true,
        department: true,
        company: {
          select: { id: true, name: true }
        }
      },
      take: 10,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });
  }

  /**
   * Get POC statistics
   * @returns {Promise<Object>} POC statistics
   */
  async getPOCStats() {
    const [total, byDesignation, byDepartment] = await Promise.all([
      prisma.pOC.count(),
      prisma.pOC.groupBy({
        by: ['designation'],
        _count: { designation: true },
        orderBy: { _count: { designation: 'desc' } },
        take: 10
      }),
      prisma.pOC.groupBy({
        by: ['department'],
        _count: { department: true },
        orderBy: { _count: { department: 'desc' } },
        take: 10
      })
    ]);

    return {
      total,
      byDesignation: byDesignation.map(item => ({
        designation: item.designation,
        count: item._count.designation
      })),
      byDepartment: byDepartment.map(item => ({
        department: item.department,
        count: item._count.department
      }))
    };
  }

  /**
   * Get POC statistics for a specific company
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} Company POC statistics
   */
  async getCompanyPOCStats(companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const [total, byDesignation, byDepartment] = await Promise.all([
      prisma.pOC.count({ where: { companyId } }),
      prisma.pOC.groupBy({
        by: ['designation'],
        where: { companyId },
        _count: { designation: true },
        orderBy: { _count: { designation: 'desc' } }
      }),
      prisma.pOC.groupBy({
        by: ['department'],
        where: { companyId },
        _count: { department: true },
        orderBy: { _count: { department: 'desc' } }
      })
    ]);

    return {
      total,
      byDesignation: byDesignation.map(item => ({
        designation: item.designation,
        count: item._count.designation
      })),
      byDepartment: byDepartment.map(item => ({
        department: item.department,
        count: item._count.department
      }))
    };
  }
}

module.exports = new POCService();
