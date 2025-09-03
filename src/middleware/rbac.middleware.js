// src/middleware/rbac.middleware.js
const RBACService = require('../services/rbac.service');

/**
 * Middleware to require specific permission
 * @param {string} permissionName - Required permission
 * @returns {Function} Express middleware function
 */
const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const hasPermission = await RBACService.hasPermission(req.user.userId, permissionName);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Middleware to require specific role
 * @param {string} roleName - Required role
 * @returns {Function} Express middleware function
 */
const requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const hasRole = await RBACService.hasRole(req.user.userId, roleName);
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role access'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

/**
 * Middleware to require minimum role hierarchy
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} Express middleware function
 */
const requireMinimumRole = (minimumRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const canAccess = await RBACService.canAccessResource(req.user.userId, minimumRole);
      
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role level'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role level check failed'
      });
    }
  };
};

/**
 * Middleware to require any of the specified roles
 * @param {Array<string>} roleNames - Array of acceptable roles
 * @returns {Function} Express middleware function
 */
const requireAnyRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRoles = await RBACService.getUserRoles(req.user.userId);
      const hasAnyRole = roleNames.some(role => userRoles.includes(role));
      
      if (!hasAnyRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role access'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
  requireMinimumRole,
  requireAnyRole
};