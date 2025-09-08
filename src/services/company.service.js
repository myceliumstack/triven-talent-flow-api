// src/services/company.service.js
const prisma = require('../config/database');

// No mapping needed - using string fields directly

class CompanyService {
  /**
   * Get all companies with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Companies with pagination info
   */
  async getAllCompanies(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      industry,
      size,
      agreementStatus,
      location,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const skip = (page - 1) * limit;

    // Build filters
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (industry) where.industry = industry;
    if (size) where.size = size;
    if (agreementStatus) where.agreementStatus = agreementStatus;
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

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          modifiedBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          _count: {
            select: { pocs: true, jobPostings: true }
          }
        }
      }),
      prisma.company.count({ where })
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Search companies by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching companies
   */
  async searchCompanies(query) {
    if (!query || query.length < 2) {
      return [];
    }

    return await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        industry: true,
        location: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get company by ID
   * @param {string} id - Company ID
   * @returns {Promise<Object>} Company details
   */
  async getCompanyById(id) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { pocs: true, jobPostings: true }
        }
      }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  /**
   * Create new company
   * @param {Object} companyData - Company data
   * @param {string} createdById - User ID who created the company
   * @returns {Promise<Object>} Created company
   */
  async createCompany(companyData, createdById) {
    // Check if company with same name already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name: companyData.name }
    });

    if (existingCompany) {
      throw new Error('Company with this name already exists');
    }

    const company = await prisma.company.create({
      data: {
        ...companyData,
        createdById
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return company;
  }

  /**
   * Update company
   * @param {string} id - Company ID
   * @param {Object} updateData - Update data
   * @param {string} modifiedById - User ID who modified the company
   * @returns {Promise<Object>} Updated company
   */
  async updateCompany(id, updateData, modifiedById) {
    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      throw new Error('Company not found');
    }

    // Check for name conflict if name is being updated
    if (updateData.name && updateData.name !== existingCompany.name) {
      const nameConflict = await prisma.company.findFirst({
        where: { 
          name: updateData.name,
          id: { not: id }
        }
      });

      if (nameConflict) {
        throw new Error('Company with this name already exists');
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...updateData,
        modifiedById
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        modifiedBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return company;
  }

  /**
   * Delete company
   * @param {string} id - Company ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCompany(id) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pocs: true, jobPostings: true }
        }
      }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Check if company has associated data
    if (company._count.pocs > 0 || company._count.jobPostings > 0) {
      throw new Error('Cannot delete company with associated POCs or job postings');
    }

    await prisma.company.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Get company statistics
   * @param {string} id - Company ID
   * @returns {Promise<Object>} Company statistics
   */
  async getCompanyStats(id) {
    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const [pocCount, jobPostingCount, activeJobPostings] = await Promise.all([
      prisma.pOC.count({ where: { companyId: id } }),
      prisma.jobPosting.count({ where: { companyId: id } }),
      prisma.jobPosting.count({ 
        where: { 
          companyId: id,
          status: 'ACTIVE' 
        } 
      })
    ]);

    return {
      totalPOCs: pocCount,
      totalJobPostings: jobPostingCount,
      activeJobPostings,
      inactiveJobPostings: jobPostingCount - activeJobPostings
    };
  }

  /**
   * Get companies by industry
   * @param {string} industry - Industry name
   * @returns {Promise<Array>} Companies in the industry
   */
  async getCompaniesByIndustry(industry) {
    return await prisma.company.findMany({
      where: { industry },
      select: {
        id: true,
        name: true,
        location: true,
        size: true,
        agreementStatus: true
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get companies by agreement status
   * @param {string} status - Agreement status
   * @returns {Promise<Array>} Companies with the status
   */
  async getCompaniesByAgreementStatus(status) {
    return await prisma.company.findMany({
      where: { agreementStatus: status },
      select: {
        id: true,
        name: true,
        industry: true,
        location: true,
        fee: true,
        paymentTerms: true
      },
      orderBy: { name: 'asc' }
    });
  }
}

module.exports = new CompanyService();
