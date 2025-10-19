// src/services/rbac-management.service.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all permissions with filters (no pagination)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Permissions without pagination
 */
const getAllPermissions = async (options = {}) => {
  try {
    const {
      resource,
      action,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

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

    const permissions = await prisma.permission.findMany({
      where,
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
    });

    return {
      permissions,
      total: permissions.length
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
      where: { id }
    });

    if (!existingPermission) {
      throw new Error('Permission not found');
    }

    // Delete permission - cascade will automatically delete related role_permissions
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
 * Delete multiple permissions
 * @param {string[]} ids - Array of Permission IDs
 * @returns {Promise<Object>} Deletion result
 */
const deletePermissions = async (ids) => {
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('Permission IDs array is required and cannot be empty');
    }

    // Check if all permissions exist
    const existingPermissions = await prisma.permission.findMany({
      where: { id: { in: ids } }
    });

    if (existingPermissions.length !== ids.length) {
      const foundIds = existingPermissions.map(p => p.id);
      const notFoundIds = ids.filter(id => !foundIds.includes(id));
      throw new Error(`Permissions not found: ${notFoundIds.join(', ')}`);
    }

    // Delete permissions - cascade will automatically delete related role_permissions
    const result = await prisma.permission.deleteMany({
      where: { id: { in: ids } }
    });

    return { 
      success: true, 
      message: `${result.count} permissions deleted successfully`,
      deletedCount: result.count
    };
  } catch (error) {
    console.error('Error in deletePermissions:', error);
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

/**
 * Assign multiple permissions to role
 * @param {string} roleId - Role ID
 * @param {string[]} permissionIds - Array of Permission IDs
 * @returns {Promise<Object>} Assignment result
 */
const assignPermissionsToRole = async (roleId, permissionIds) => {
  try {
    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      throw new Error('Permission IDs array is required and cannot be empty');
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if all permissions exist
    const existingPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } }
    });

    if (existingPermissions.length !== permissionIds.length) {
      const foundIds = existingPermissions.map(p => p.id);
      const notFoundIds = permissionIds.filter(id => !foundIds.includes(id));
      throw new Error(`Permissions not found: ${notFoundIds.join(', ')}`);
    }

    // Check for existing assignments to avoid duplicates
    const existingAssignments = await prisma.rolePermission.findMany({
      where: {
        roleId,
        permissionId: { in: permissionIds }
      }
    });

    const existingPermissionIds = existingAssignments.map(ra => ra.permissionId);
    const newPermissionIds = permissionIds.filter(id => !existingPermissionIds.includes(id));

    if (newPermissionIds.length === 0) {
      throw new Error('All permissions are already assigned to this role');
    }

    // Create new assignments
    const assignments = await prisma.rolePermission.createMany({
      data: newPermissionIds.map(permissionId => ({
        roleId,
        permissionId
      }))
    });

    return {
      success: true,
      message: `${assignments.count} permissions assigned to role successfully`,
      assignedCount: assignments.count,
      skippedCount: existingPermissionIds.length
    };
  } catch (error) {
    console.error('Error in assignPermissionsToRole:', error);
    throw error;
  }
};

/**
 * Remove multiple permissions from role
 * @param {string} roleId - Role ID
 * @param {string[]} permissionIds - Array of Permission IDs
 * @returns {Promise<Object>} Removal result
 */
const removePermissionsFromRole = async (roleId, permissionIds) => {
  try {
    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      throw new Error('Permission IDs array is required and cannot be empty');
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Find existing assignments
    const existingAssignments = await prisma.rolePermission.findMany({
      where: {
        roleId,
        permissionId: { in: permissionIds }
      }
    });

    if (existingAssignments.length === 0) {
      throw new Error('No permission assignments found for this role');
    }

    // Remove assignments
    const result = await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds }
      }
    });

    return {
      success: true,
      message: `${result.count} permissions removed from role successfully`,
      removedCount: result.count
    };
  } catch (error) {
    console.error('Error in removePermissionsFromRole:', error);
    throw error;
  }
};

/**
 * Get all permissions for a specific role
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Role permissions
 */
const getRolePermissions = async (roleId) => {
  try {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Get all permissions assigned to this role
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          select: {
            id: true,
            name: true,
            resource: true,
            action: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        permission: {
          name: 'asc'
        }
      }
    });

    // Extract permissions from the role-permission relationships
    const permissions = rolePermissions.map(rp => rp.permission);

    return {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        department: role.department,
        isActive: role.isActive
      },
      permissions,
      total: permissions.length
    };
  } catch (error) {
    console.error('Error in getRolePermissions:', error);
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
  deletePermissions,
  
  // Role CRUD
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  
  // Role-Permission management
  assignPermissionToRole,
  removePermissionFromRole,
  assignPermissionsToRole,
  removePermissionsFromRole,
  getRolePermissions
};
