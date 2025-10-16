// src/controllers/rbac-management.controller.js
const RBACManagementService = require('../services/rbac-management.service');

/**
 * Get all permissions with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPermissions = async (req, res) => {
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
    } = req.query;

    const result = await RBACManagementService.getAllPermissions({
      page: parseInt(page),
      limit: parseInt(limit),
      resource,
      action,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      message: 'Permissions retrieved successfully',
      data: result.permissions,
      pagination: result.pagination
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
 * Get permission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await RBACManagementService.getPermissionById(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      message: 'Permission retrieved successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error getting permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permission',
      error: error.message
    });
  }
};

/**
 * Create a new permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPermission = async (req, res) => {
  try {
    const permissionData = req.body;

    if (!permissionData.name || !permissionData.resource || !permissionData.action) {
      return res.status(400).json({
        success: false,
        message: 'Name, resource, and action are required'
      });
    }

    const permission = await RBACManagementService.createPermission(permissionData);

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    if (error.message === 'Permission with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create permission',
      error: error.message
    });
  }
};

/**
 * Update a permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const permission = await RBACManagementService.updatePermission(id, updateData);

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    if (error.message === 'Permission not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Permission with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update permission',
      error: error.message
    });
  }
};

/**
 * Delete a permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await RBACManagementService.deletePermission(id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    if (error.message === 'Permission not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Cannot delete permission that is assigned to roles') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete permission',
      error: error.message
    });
  }
};

/**
 * Get all roles with filters (no pagination)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRoles = async (req, res) => {
  try {
    const {
      department,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const result = await RBACManagementService.getAllRoles({
      department,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      message: 'Roles retrieved successfully',
      data: result.roles,
      total: result.total
    });
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get roles',
      error: error.message
    });
  }
};

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await RBACManagementService.getRoleById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role retrieved successfully',
      data: role
    });
  } catch (error) {
    console.error('Error getting role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get role',
      error: error.message
    });
  }
};

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = async (req, res) => {
  try {
    const roleData = req.body;

    if (!roleData.name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    const role = await RBACManagementService.createRole(roleData);

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Error creating role:', error);
    if (error.message === 'Role with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
};

/**
 * Update a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const role = await RBACManagementService.updateRole(id, updateData);

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Error updating role:', error);
    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Role with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
};

/**
 * Delete a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await RBACManagementService.deleteRole(id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    if (error.message === 'Role not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Cannot delete role that has users assigned' || 
        error.message === 'Cannot delete role that has child roles') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
};

/**
 * Assign permission to role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        success: false,
        message: 'Role ID and Permission ID are required'
      });
    }

    const rolePermission = await RBACManagementService.assignPermissionToRole(roleId, permissionId);

    res.status(201).json({
      success: true,
      message: 'Permission assigned to role successfully',
      data: rolePermission
    });
  } catch (error) {
    console.error('Error assigning permission to role:', error);
    if (error.message === 'Role not found' || error.message === 'Permission not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Permission already assigned to this role') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to assign permission to role',
      error: error.message
    });
  }
};

/**
 * Remove permission from role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        success: false,
        message: 'Role ID and Permission ID are required'
      });
    }

    const result = await RBACManagementService.removePermissionFromRole(roleId, permissionId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error removing permission from role:', error);
    if (error.message === 'Permission assignment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to remove permission from role',
      error: error.message
    });
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
