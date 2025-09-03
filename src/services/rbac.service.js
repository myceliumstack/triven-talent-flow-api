// src/services/rbac.service.js
const prisma = require('../config/database');

class RBACService {
  /**
   * Check if user has specific permission
   * @param {string} userId - User ID
   * @param {string} permissionName - Permission to check
   * @returns {Promise<boolean>} True if user has permission
   */
  async hasPermission(userId, permissionName) {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permissionName);
  }

  /**
   * Check if user has specific role
   * @param {string} userId - User ID
   * @param {string} roleName - Role to check
   * @returns {Promise<boolean>} True if user has role
   */
  async hasRole(userId, roleName) {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes(roleName);
  }

  /**
   * Get all permissions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of permission names
   */
  async getUserPermissions(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return [];
    }

    // Extract unique permissions from all user roles
    const permissions = new Set();
    user.userRoles.forEach(userRole => {
      userRole.role.rolePermissions.forEach(rolePermission => {
        if (rolePermission.permission.isActive) {
          permissions.add(rolePermission.permission.name);
        }
      });
    });

    return Array.from(permissions);
  }

  /**
   * Get all roles for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of role names
   */
  async getUserRoles(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return [];
    }

    return user.userRoles
      .filter(userRole => userRole.role.isActive)
      .map(userRole => userRole.role.name);
  }

  /**
   * Get user's highest role (lowest hierarchy number)
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Highest role or null
   */
  async getUserHighestRole(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user || user.userRoles.length === 0) {
      return null;
    }

    // Find role with lowest hierarchy number (highest priority)
    const highestRole = user.userRoles
      .filter(userRole => userRole.role.isActive)
      .reduce((prev, current) => 
        prev.role.hierarchy < current.role.hierarchy ? prev : current
      );

    return highestRole.role;
  }

  /**
   * Check if user can access resource based on role hierarchy
   * @param {string} userId - User ID
   * @param {string} requiredRole - Minimum role required
   * @returns {Promise<boolean>} True if user can access
   */
  async canAccessResource(userId, requiredRole) {
    const userHighestRole = await this.getUserHighestRole(userId);
    if (!userHighestRole) {
      return false;
    }

    const requiredRoleData = await prisma.role.findUnique({
      where: { name: requiredRole }
    });

    if (!requiredRoleData) {
      return false;
    }

    // User can access if their highest role has lower hierarchy number
    // (Admin=0, RA Manager=1, Team Manager=2, etc.)
    return userHighestRole.hierarchy <= requiredRoleData.hierarchy;
  }
}

module.exports = new RBACService();