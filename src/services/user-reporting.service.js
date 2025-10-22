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

/**
 * Assign a manager to a user
 * @param {string} userId - User's ID
 * @param {string} managerId - Manager's user ID
 * @returns {Promise<Object>} Manager assignment result
 */
const assignManagerToUser = async (userId, managerId) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if manager exists
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!manager) {
      throw new Error('Manager not found');
    }

    // Check if user is trying to assign themselves as their own manager
    if (userId === managerId) {
      throw new Error('User cannot be their own manager');
    }

    // Check if relationship already exists and is active
    const existingRelationship = await prisma.userReporting.findFirst({
      where: {
        userId: userId,
        managerId: managerId,
        isActive: true
      }
    });

    if (existingRelationship) {
      throw new Error('Manager relationship already exists');
    }

    // Deactivate any existing manager relationships for this user
    await prisma.userReporting.updateMany({
      where: {
        userId: userId,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Create new manager relationship
    const userReporting = await prisma.userReporting.create({
      data: {
        userId: userId,
        managerId: managerId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      id: userReporting.id,
      user: userReporting.user,
      manager: userReporting.manager,
      assignedAt: userReporting.createdAt,
      isActive: userReporting.isActive
    };
  } catch (error) {
    console.error('Error assigning manager to user:', error);
    throw error;
  }
};

/**
 * Update user manager assignment (PATCH)
 * @param {string} userId - User's ID
 * @param {string} newManagerId - New manager's user ID
 * @returns {Promise<Object>} Updated manager assignment
 */
const updateUserManager = async (userId, newManagerId) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if new manager exists
    const newManager = await prisma.user.findUnique({
      where: { id: newManagerId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!newManager) {
      throw new Error('Manager not found');
    }

    // Check if user is trying to assign themselves as their own manager
    if (userId === newManagerId) {
      throw new Error('User cannot be their own manager');
    }

    // Check if user has an existing manager relationship
    const existingRelationship = await prisma.userReporting.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    });

    if (!existingRelationship) {
      throw new Error('User does not have an existing manager relationship');
    }

    // Check if the new manager relationship already exists
    const newRelationshipExists = await prisma.userReporting.findFirst({
      where: {
        userId: userId,
        managerId: newManagerId,
        isActive: true
      }
    });

    if (newRelationshipExists) {
      throw new Error('User already has this manager');
    }

    // Update the manager relationship
    const updatedUserReporting = await prisma.userReporting.update({
      where: { id: existingRelationship.id },
      data: {
        managerId: newManagerId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      id: updatedUserReporting.id,
      user: updatedUserReporting.user,
      manager: updatedUserReporting.manager,
      assignedAt: updatedUserReporting.createdAt,
      updatedAt: updatedUserReporting.updatedAt,
      isActive: updatedUserReporting.isActive
    };
  } catch (error) {
    console.error('Error updating user manager:', error);
    throw error;
  }
};

/**
 * Replace user manager assignment (PUT)
 * @param {string} userId - User's ID
 * @param {string} managerId - Manager's user ID
 * @returns {Promise<Object>} Manager assignment result
 */
const replaceUserManager = async (userId, managerId) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if manager exists
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!manager) {
      throw new Error('Manager not found');
    }

    // Check if user is trying to assign themselves as their own manager
    if (userId === managerId) {
      throw new Error('User cannot be their own manager');
    }

    // Replace manager relationship in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate all existing manager relationships for this user
      await tx.userReporting.updateMany({
        where: {
          userId: userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      // Create new manager relationship
      const userReporting = await tx.userReporting.create({
        data: {
          userId: userId,
          managerId: managerId,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          manager: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return userReporting;
    });

    return {
      id: result.id,
      user: result.user,
      manager: result.manager,
      assignedAt: result.createdAt,
      isActive: result.isActive
    };
  } catch (error) {
    console.error('Error replacing user manager:', error);
    throw error;
  }
};

module.exports = {
  getDirectReportees,
  getAllReportees,
  getManager,
  getOrganizationalHierarchy,
  assignManagerToUser,
  updateUserManager,
  replaceUserManager
};
