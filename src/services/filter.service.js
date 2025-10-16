// src/services/filter.service.js
const prisma = require('../config/database');

// Get all BDM users (basic info for posting assignment)
const getAllBDMUsers = async () => {
  try {
    const bdmUsers = await prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              name: 'BDM'
            }
          }
        },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        entity: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    return bdmUsers;
  } catch (error) {
    console.error('Error fetching BDM users:', error);
    throw new Error('Failed to fetch BDM users');
  }
};

// Get BDM users by specific entities
const getBDMUsersByEntities = async (entityIds) => {
  try {
    const bdmUsers = await prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              name: 'BDM'
            }
          }
        },
        entityId: {
          in: entityIds
        },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        entity: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: [
        {
          entity: {
            name: 'asc'
          }
        },
        {
          firstName: 'asc'
        }
      ]
    });

    return bdmUsers;
  } catch (error) {
    console.error('Error fetching BDM users by entities:', error);
    throw new Error('Failed to fetch BDM users by entities');
  }
};

module.exports = {
  getAllBDMUsers,
  getBDMUsersByEntities
};
