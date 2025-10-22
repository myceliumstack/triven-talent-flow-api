// src/controllers/user.controller.js
const userService = require('../services/user.service');
const userReportingService = require('../services/user-reporting.service');

/**
 * Get all users with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      roleId,
      sortBy = 'firstName',
      sortOrder = 'asc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      roleId,
      sortBy,
      sortOrder
    };

    const result = await userService.getAllUsers(options);

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message
      });
    }
  }
};

/**
 * Create new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const createdById = req.user.id; // From auth middleware

    // Validate required fields
    const { email, password, firstName, lastName } = userData;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName, and lastName are required'
      });
    }

    const user = await userService.createUser(userData, createdById);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('already exists') || error.message.includes('Invalid role')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const modifiedById = req.user.id; // From auth middleware

    const user = await userService.updateUser(id, updateData, modifiedById);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message === 'User not found' || error.message.includes('already exists') || error.message.includes('Invalid role')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.message === 'User not found' || error.message.includes('Cannot delete user')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }
};

/**
 * Toggle user active status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.toggleUserStatus(id);

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to toggle user status',
        error: error.message
      });
    }
  }
};

/**
 * Get user statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
};

/**
 * Search users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchUsers = async (req, res) => {
  try {
    const { q, query } = req.query;
    const searchQuery = q || query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await userService.searchUsers(searchQuery);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting current user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

/**
 * Update current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated by the user themselves
    delete updateData.roleId;
    delete updateData.isActive;

    const user = await userService.updateUser(userId, updateData, userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating current user profile:', error);
    if (error.message.includes('already exists')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }
};

/**
 * Assign role to user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignRoleToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'Role ID is required'
      });
    }

    const userRole = await userService.assignRoleToUser(userId, roleId);

    res.json({
      success: true,
      message: 'Role assigned to user successfully',
      data: userRole
    });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    if (error.message === 'User not found' || error.message === 'Role not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === 'User already has this role') {
      res.status(409).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to assign role to user',
        error: error.message
      });
    }
  }
};

/**
 * Remove role from user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    const result = await userService.removeRoleFromUser(userId, roleId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error removing role from user:', error);
    if (error.message === 'User role assignment not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to remove role from user',
        error: error.message
      });
    }
  }
};

/**
 * Update user role assignment (PATCH)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserRole = async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    const { newRoleId } = req.body;

    if (!newRoleId) {
      return res.status(400).json({
        success: false,
        message: 'New role ID is required'
      });
    }

    const result = await userService.updateUserRole(userId, roleId, newRoleId);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    if (error.message === 'User not found' || error.message === 'Role not found' || error.message === 'User role assignment not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === 'User already has this role') {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update user role',
        error: error.message
      });
    }
  }
};

/**
 * Replace all user roles (PUT)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const replaceUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds)) {
      return res.status(400).json({
        success: false,
        message: 'Role IDs array is required'
      });
    }

    const result = await userService.replaceUserRoles(userId, roleIds);

    res.json({
      success: true,
      message: 'User roles replaced successfully',
      data: result
    });
  } catch (error) {
    console.error('Error replacing user roles:', error);
    if (error.message === 'User not found' || error.message === 'Role not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to replace user roles',
        error: error.message
      });
    }
  }
};

/**
 * Get user's roles and permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserRolesAndPermissions = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const result = await userService.getUserRolesAndPermissions(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting user roles and permissions:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get user roles and permissions',
        error: error.message
      });
    }
  }
};

/**
 * Get all roles with their permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRolesWithPermissions = async (req, res) => {
  try {
    const roles = await userService.getAllRolesWithPermissions();

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error getting roles with permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get roles with permissions',
      error: error.message
    });
  }
};

/**
 * Get all permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await userService.getAllPermissions();

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error getting permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: error.message
    });
  }
};

/**
 * Create new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = async (req, res) => {
  try {
    const { name, description, hierarchy, permissionIds } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    const role = await userService.createRole({
      name,
      description,
      hierarchy,
      permissionIds
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Error creating role:', error);
    if (error.message === 'Role with this name already exists') {
      res.status(409).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create role',
        error: error.message
      });
    }
  }
};

/**
 * Update role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const updateData = req.body;

    const role = await userService.updateRole(roleId, updateData);

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Error updating role:', error);
    if (error.message === 'Role not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === 'Role with this name already exists') {
      res.status(409).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update role',
        error: error.message
      });
    }
  }
};

/**
 * Delete role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const result = await userService.deleteRole(roleId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    if (error.message === 'Role not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === 'Cannot delete role that is assigned to users') {
      res.status(409).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete role',
        error: error.message
      });
    }
  }
};

/**
 * Get all unique departments with their roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDepartments = async (req, res) => {
  try {
    const result = await userService.getDepartments();
    res.json({
      success: true,
      message: 'Departments retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get departments',
      error: error.message
    });
  }
};

/**
 * Get all managers for a given role ID based on hierarchy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getManagersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'Role ID is required'
      });
    }
    const result = await userService.getManagersByRole(roleId);
    res.json({
      success: true,
      message: 'Managers retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting managers by role:', error);
    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to get managers',
      error: error.message
    });
  }
};

/**
 * Get subordinates (direct reportees) for a given user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSubordinates = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const subordinates = await userReportingService.getDirectReportees(id);
    
    res.json({
      success: true,
      message: 'Subordinates retrieved successfully',
      data: subordinates,
      count: subordinates.length
    });
  } catch (error) {
    console.error('Error getting subordinates:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to get subordinates',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  searchUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  assignRoleToUser,
  removeRoleFromUser,
  updateUserRole,
  replaceUserRoles,
  getUserRolesAndPermissions,
  getAllRolesWithPermissions,
  getAllPermissions,
  createRole,
  updateRole,
  deleteRole,
  getDepartments,
  getManagersByRole,
  getSubordinates
};
