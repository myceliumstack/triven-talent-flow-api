const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all direct reportees for a manager
 * @param {string} managerId - Manager's user ID
 * @returns {Promise<Array>} List of direct reportees
 */
const getDirectReportees = async (managerId) => {
  try {
    const reportees = await prisma.userReporting.findMany({
      where: {
        managerId: managerId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            userRoles: {
              include: {
                role: {
                  select: {
                    name: true,
                    hierarchy: true,
                    department: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return reportees.map(report => ({
      id: report.user.id,
      email: report.user.email,
      firstName: report.user.firstName,
      lastName: report.user.lastName,
      isActive: report.user.isActive,
      role: report.user.userRoles[0]?.role || null,
      reportingSince: report.createdAt
    }));
  } catch (error) {
    console.error('Error fetching direct reportees:', error);
    throw new Error('Failed to fetch direct reportees');
  }
};

/**
 * Get all reportees in the management chain (direct + indirect)
 * @param {string} managerId - Manager's user ID
 * @returns {Promise<Array>} List of all reportees in the chain
 */
const getAllReportees = async (managerId) => {
  try {
    const allReportees = [];
    const directReportees = await getDirectReportees(managerId);
    
    allReportees.push(...directReportees);
    
    // Recursively get reportees of each direct reportee
    for (const reportee of directReportees) {
      const subReportees = await getAllReportees(reportee.id);
      allReportees.push(...subReportees);
    }
    
    return allReportees;
  } catch (error) {
    console.error('Error fetching all reportees:', error);
    throw new Error('Failed to fetch all reportees');
  }
};

/**
 * Get manager information for a user
 * @param {string} userId - User's ID
 * @returns {Promise<Object|null>} Manager information
 */
const getManager = async (userId) => {
  try {
    const reporting = await prisma.userReporting.findFirst({
      where: {
        userId: userId,
        isActive: true
      },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userRoles: {
              include: {
                role: {
                  select: {
                    name: true,
                    hierarchy: true,
                    department: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!reporting) return null;

    return {
      id: reporting.manager.id,
      email: reporting.manager.email,
      firstName: reporting.manager.firstName,
      lastName: reporting.manager.lastName,
      role: reporting.manager.userRoles[0]?.role || null,
      reportingSince: reporting.createdAt
    };
  } catch (error) {
    console.error('Error fetching manager:', error);
    throw new Error('Failed to fetch manager');
  }
};

/**
 * Get organizational hierarchy for a user
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Complete hierarchy information
 */
const getOrganizationalHierarchy = async (userId) => {
  try {
    const manager = await getManager(userId);
    const directReportees = await getDirectReportees(userId);
    const allReportees = await getAllReportees(userId);

    return {
      manager,
      directReportees,
      allReportees,
      totalDirectReportees: directReportees.length,
      totalAllReportees: allReportees.length
    };
  } catch (error) {
    console.error('Error fetching organizational hierarchy:', error);
    throw new Error('Failed to fetch organizational hierarchy');
  }
};

module.exports = {
  getDirectReportees,
  getAllReportees,
  getManager,
  getOrganizationalHierarchy
};
