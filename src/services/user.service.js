// src/services/user.service.js
const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password.utils');

/**
 * Get all users with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Users with pagination info
 */
const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive,
    roleId,
    sortBy = 'firstName',
    sortOrder = 'asc'
  } = options;

  const skip = (page - 1) * limit;

  // Build filters
  const where = {};
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (roleId) {
    where.userRoles = {
      some: {
        roleId: roleId
      }
    };
  }

  // Build sort order
  const orderBy = {};
  orderBy[sortBy] = sortOrder;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          },
          entity: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User details
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: {
            select: { id: true, name: true, description: true }
          }
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User details
 */
const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: {
            select: { id: true, name: true, description: true }
          }
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user; // Return with password for authentication
};

/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} createdById - User ID who created the user
 * @returns {Promise<Object>} Created user
 */
const createUser = async (userData, createdById) => {
  const { email, password, firstName, lastName, roleId, isActive = true } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Verify role exists if provided
  if (roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Invalid role specified');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user and assign role in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isActive
      }
    });

    // Assign role if provided
    if (roleId) {
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId
        }
      });
    }

    return user;
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} updateData - Update data
 * @param {string} modifiedById - User ID who modified the user
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (id, updateData, modifiedById) => {
  const { email, password, firstName, lastName, isActive, roleId, entityId } = updateData;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Check if email is being changed and if it already exists
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    });

    if (emailExists) {
      throw new Error('User with this email already exists');
    }
  }

  // Verify role exists if provided
  if (roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Invalid role specified');
    }
  }

  // Verify entity exists if provided
  if (entityId) {
    const entity = await prisma.entity.findUnique({
      where: { id: entityId }
    });

    if (!entity) {
      throw new Error('Invalid entity specified');
    }
  }

  // Prepare update data
  const updateFields = {};
  if (email) updateFields.email = email;
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (entityId !== undefined) updateFields.entityId = entityId;

  // Hash password if provided
  if (password) {
    updateFields.password = await hashPassword(password);
  }

  // Update user and handle role assignment in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update user
    const user = await tx.user.update({
      where: { id },
      data: updateFields
    });

    // Handle role assignment if provided
    if (roleId) {
      // Remove existing roles
      await tx.userRole.deleteMany({
        where: { userId: id }
      });

      // Add new role
      await tx.userRole.create({
        data: {
          userId: id,
          roleId
        }
      });
    }

    return user;
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise<boolean>} Success status
 */
const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { 
          userRoles: true,
          createdJobPostings: true,
          modifiedJobPostings: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has dependencies
  if (user._count.userRoles > 0) {
    throw new Error('Cannot delete user with assigned roles');
  }

  if (user._count.createdJobPostings > 0 || user._count.modifiedJobPostings > 0) {
    throw new Error('Cannot delete user with associated job postings');
  }

  await prisma.user.delete({
    where: { id }
  });

  return true;
};

/**
 * Toggle user active status
 * @param {string} id - User ID
 * @returns {Promise<Object>} Updated user
 */
const toggleUserStatus = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    include: {
      userRoles: {
        include: {
          role: {
            select: { id: true, name: true, description: true }
          }
        }
      }
    }
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
const getUserStats = async () => {
  const [total, active, inactive, roleCounts] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.userRole.groupBy({
      by: ['roleId'],
      _count: { roleId: true }
    })
  ]);

  // Get role names for the counts
  const roleIds = roleCounts.map(rc => rc.roleId);
  const roles = await prisma.role.findMany({
    where: { id: { in: roleIds } },
    select: { id: true, name: true }
  });

  // Map role counts with role names
  const byRole = roleCounts.map(rc => {
    const role = roles.find(r => r.id === rc.roleId);
    return {
      roleId: rc.roleId,
      roleName: role ? role.name : 'Unknown',
      count: rc._count.roleId
    };
  });

  return {
    total,
    active,
    inactive,
    byRole
  };
};

/**
 * Search users by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching users
 */
const searchUsers = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      userRoles: {
        include: {
          role: {
            select: { id: true, name: true, description: true }
          }
        }
      }
    },
    take: 10,
    orderBy: { firstName: 'asc' }
  });

  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

/**
 * Assign role to user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} User role assignment
 */
const assignRoleToUser = async (userId, roleId) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    throw new Error('User not found');
  }

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });
  
  if (!role) {
    throw new Error('Role not found');
  }

  // Check if assignment already exists
  const existingAssignment = await prisma.userRole.findFirst({
    where: {
      userId: userId,
      roleId: roleId
    }
  });

  if (existingAssignment) {
    throw new Error('User already has this role');
  }

  // Create the assignment
  const userRole = await prisma.userRole.create({
    data: {
      userId: userId,
      roleId: roleId
    },
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
  });

  return userRole;
};

/**
 * Remove role from user
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Success message
 */
const removeRoleFromUser = async (userId, roleId) => {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId: userId,
      roleId: roleId
    }
  });

  if (!userRole) {
    throw new Error('User role assignment not found');
  }

  await prisma.userRole.delete({
    where: { id: userRole.id }
  });

  return { message: 'Role removed from user successfully' };
};

/**
 * Get user's roles and permissions
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User with roles and permissions
 */
const getUserRolesAndPermissions = async (userId) => {
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
      },
      entity: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Extract all permissions from user's roles
  const allPermissions = new Set();
  user.userRoles.forEach(userRole => {
    userRole.role.rolePermissions.forEach(rolePermission => {
      if (rolePermission.permission.isActive) {
        allPermissions.add(rolePermission.permission.name);
      }
    });
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      entity: user.entity
    },
    roles: user.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
      hierarchy: ur.role.hierarchy,
      isActive: ur.role.isActive,
      permissions: ur.role.rolePermissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        isActive: rp.permission.isActive
      }))
    })),
    allPermissions: Array.from(allPermissions)
  };
};

/**
 * Get all roles with their permissions
 * @returns {Promise<Array>} All roles with permissions
 */
const getAllRolesWithPermissions = async () => {
  const roles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      },
      userRoles: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: { hierarchy: 'asc' }
  });

  return roles.map(role => ({
    id: role.id,
    name: role.name,
    description: role.description,
    hierarchy: role.hierarchy,
    isActive: role.isActive,
    userCount: role.userRoles.length,
    permissions: role.rolePermissions.map(rp => ({
      id: rp.permission.id,
      name: rp.permission.name,
      resource: rp.permission.resource,
      action: rp.permission.action,
      isActive: rp.permission.isActive
    })),
    users: role.userRoles.map(ur => ur.user)
  }));
};

/**
 * Get all permissions
 * @returns {Promise<Array>} All permissions
 */
const getAllPermissions = async () => {
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { resource: 'asc' },
      { action: 'asc' }
    ]
  });

  return permissions;
};

/**
 * Create new role
 * @param {Object} roleData - Role data
 * @returns {Promise<Object>} Created role
 */
const createRole = async (roleData) => {
  const { name, description, hierarchy, permissionIds = [] } = roleData;

  // Check if role name already exists
  const existingRole = await prisma.role.findUnique({
    where: { name }
  });

  if (existingRole) {
    throw new Error('Role with this name already exists');
  }

  // Create role
  const role = await prisma.role.create({
    data: {
      name,
      description,
      hierarchy: hierarchy || 999
    }
  });

  // Assign permissions if provided
  if (permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({
        roleId: role.id,
        permissionId
      }))
    });
  }

  // Return role with permissions
  return await prisma.role.findUnique({
    where: { id: role.id },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  });
};

/**
 * Update role
 * @param {string} roleId - Role ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated role
 */
const updateRole = async (roleId, updateData) => {
  const { name, description, hierarchy, permissionIds } = updateData;

  // Check if role exists
  const existingRole = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!existingRole) {
    throw new Error('Role not found');
  }

  // Check if new name conflicts with existing role
  if (name && name !== existingRole.name) {
    const nameConflict = await prisma.role.findUnique({
      where: { name }
    });

    if (nameConflict) {
      throw new Error('Role with this name already exists');
    }
  }

  // Update role
  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(hierarchy !== undefined && { hierarchy })
    }
  });

  // Update permissions if provided
  if (permissionIds !== undefined) {
    // Remove existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: roleId }
    });

    // Add new permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: roleId,
          permissionId
        }))
      });
    }
  }

  // Return updated role with permissions
  return await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  });
};

/**
 * Delete role
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Success message
 */
const deleteRole = async (roleId) => {
  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      userRoles: true
    }
  });

  if (!role) {
    throw new Error('Role not found');
  }

  // Check if role is assigned to any users
  if (role.userRoles.length > 0) {
    throw new Error('Cannot delete role that is assigned to users');
  }

  // Delete role (cascade will handle rolePermissions)
  await prisma.role.delete({
    where: { id: roleId }
  });

  return { message: 'Role deleted successfully' };
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  searchUsers,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRolesAndPermissions,
  getAllRolesWithPermissions,
  getAllPermissions,
  createRole,
  updateRole,
  deleteRole
};
