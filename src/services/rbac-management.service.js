// src/services/rbac-management.service.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all permissions with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Permissions with pagination
 */
const getAllPermissions = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      resource,
      action,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (resource) where.resource = resource;
    if (action) where.action = action;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          rolePermissions: {
            include: {
              role: {
                select: { id: true, name: true }
              }
            }
          }
        }
      }),
      prisma.permission.count({ where })
    ]);

    return {
      permissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getAllPermissions:', error);
    throw new Error('Failed to fetch permissions');
  }
};

/**
 * Get permission by ID
 * @param {string} id - Permission ID
 * @returns {Promise<Object|null>} Permission or null
 */
const getPermissionById = async (id) => {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    return permission;
  } catch (error) {
    console.error('Error in getPermissionById:', error);
    throw new Error('Failed to fetch permission');
  }
};

/**
 * Create a new permission
 * @param {Object} permissionData - Permission data
 * @returns {Promise<Object>} Created permission
 */
const createPermission = async (permissionData) => {
  try {
    // Check if permission with same name already exists
    const existingPermission = await prisma.permission.findFirst({
      where: { name: permissionData.name }
    });

    if (existingPermission) {
      throw new Error('Permission with this name already exists');
    }

    const permission = await prisma.permission.create({
      data: permissionData
    });

    return permission;
  } catch (error) {
    console.error('Error in createPermission:', error);
    throw error;
  }
};

/**
 * Update a permission
 * @param {string} id - Permission ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated permission
 */
const updatePermission = async (id, updateData) => {
  try {
    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id }
    });

    if (!existingPermission) {
      throw new Error('Permission not found');
    }

    // Check if name conflicts with other permissions
    if (updateData.name && updateData.name !== existingPermission.name) {
      const conflictingPermission = await prisma.permission.findFirst({
        where: {
          id: { not: id },
          name: updateData.name
        }
      });

      if (conflictingPermission) {
        throw new Error('Permission with this name already exists');
      }
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: updateData
    });

    return permission;
  } catch (error) {
    console.error('Error in updatePermission:', error);
    throw error;
  }
};

/**
 * Delete a permission
 * @param {string} id - Permission ID
 * @returns {Promise<Object>} Deletion result
 */
const deletePermission = async (id) => {
  try {
    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: true
      }
    });

    if (!existingPermission) {
      throw new Error('Permission not found');
    }

    // Check if permission is being used in role assignments
    if (existingPermission.rolePermissions.length > 0) {
      throw new Error('Cannot delete permission that is assigned to roles');
    }

    await prisma.permission.delete({
      where: { id }
    });

    return { success: true, message: 'Permission deleted successfully' };
  } catch (error) {
    console.error('Error in deletePermission:', error);
    throw error;
  }
};

/**
 * Get all roles with filters (no pagination)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Roles without pagination
 */
const getAllRoles = async (options = {}) => {
  try {
    const {
      department,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    // Build where clause
    const where = {};
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const roles = await prisma.role.findMany({
      where,
      orderBy,
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true }
        },
        rolePermissions: {
          include: {
            permission: {
              select: { id: true, name: true, resource: true, action: true }
            }
          }
        },
        userRoles: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    return {
      roles,
      total: roles.length
    };
  } catch (error) {
    console.error('Error in getAllRoles:', error);
    throw new Error('Failed to fetch roles');
  }
};

/**
 * Get role by ID
 * @param {string} id - Role ID
 * @returns {Promise<Object|null>} Role or null
 */
const getRoleById = async (id) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true }
        },
        rolePermissions: {
          include: {
            permission: {
              select: { id: true, name: true, resource: true, action: true }
            }
          }
        },
        userRoles: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    return role;
  } catch (error) {
    console.error('Error in getRoleById:', error);
    throw new Error('Failed to fetch role');
  }
};

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @returns {Promise<Object>} Created role
 */
const createRole = async (roleData) => {
  try {
    const { permissions, ...roleInfo } = roleData;

    // Check if role with same name already exists
    const existingRole = await prisma.role.findFirst({
      where: { name: roleInfo.name }
    });

    if (existingRole) {
      throw new Error('Role with this name already exists');
    }

    const role = await prisma.role.create({
      data: roleInfo
    });

    // Assign permissions if provided
    if (permissions && permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map(permissionId => ({
          roleId: role.id,
          permissionId
        }))
      });
    }

    return await getRoleById(role.id);
  } catch (error) {
    console.error('Error in createRole:', error);
    throw error;
  }
};

/**
 * Update a role
 * @param {string} id - Role ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated role
 */
const updateRole = async (id, updateData) => {
  try {
    const { permissions, ...roleInfo } = updateData;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      throw new Error('Role not found');
    }

    // Check if name conflicts with other roles
    if (roleInfo.name && roleInfo.name !== existingRole.name) {
      const conflictingRole = await prisma.role.findFirst({
        where: {
          id: { not: id },
          name: roleInfo.name
        }
      });

      if (conflictingRole) {
        throw new Error('Role with this name already exists');
      }
    }

    // Update role
    const role = await prisma.role.update({
      where: { id },
      data: roleInfo
    });

    // Update permissions if provided
    if (permissions !== undefined) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Add new permissions
      if (permissions.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissions.map(permissionId => ({
            roleId: id,
            permissionId
          }))
        });
      }
    }

    return await getRoleById(id);
  } catch (error) {
    console.error('Error in updateRole:', error);
    throw error;
  }
};

/**
 * Delete a role
 * @param {string} id - Role ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteRole = async (id) => {
  try {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
        children: true
      }
    });

    if (!existingRole) {
      throw new Error('Role not found');
    }

    // Check if role has users assigned
    if (existingRole.userRoles.length > 0) {
      throw new Error('Cannot delete role that has users assigned');
    }

    // Check if role has child roles
    if (existingRole.children.length > 0) {
      throw new Error('Cannot delete role that has child roles');
    }

    // Delete role (cascade will handle rolePermissions)
    await prisma.role.delete({
      where: { id }
    });

    return { success: true, message: 'Role deleted successfully' };
  } catch (error) {
    console.error('Error in deleteRole:', error);
    throw error;
  }
};

/**
 * Assign permission to role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<Object>} Assignment result
 */
const assignPermissionToRole = async (roleId, permissionId) => {
  try {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId }
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId
      }
    });

    if (existingAssignment) {
      throw new Error('Permission already assigned to this role');
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId
      }
    });

    return rolePermission;
  } catch (error) {
    console.error('Error in assignPermissionToRole:', error);
    throw error;
  }
};

/**
 * Remove permission from role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Promise<Object>} Removal result
 */
const removePermissionFromRole = async (roleId, permissionId) => {
  try {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId
      }
    });

    if (!rolePermission) {
      throw new Error('Permission assignment not found');
    }

    await prisma.rolePermission.delete({
      where: { id: rolePermission.id }
    });

    return { success: true, message: 'Permission removed from role successfully' };
  } catch (error) {
    console.error('Error in removePermissionFromRole:', error);
    throw error;
  }
};

module.exports = {
  // Permission CRUD
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  
  // Role CRUD
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  
  // Role-Permission management
  assignPermissionToRole,
  removePermissionFromRole
};
