// src/services/auth.service.js
const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const { generateToken } = require('../utils/jwt.utils');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user (without password)
 */
const registerUser = async (userData) => {
    const { email, password, firstName, lastName, roleId } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Invalid role specified');
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
          lastName
        }
      });

      // Assign role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId
        }
      });

      return user;
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = result;
    return userWithoutPassword;
};

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data with token and roles
 */
const loginUser = async (email, password) => {
    // Find user with roles
    const user = await prisma.user.findUnique({
      where: { email },
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
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Extract user roles and permissions
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles,
      permissions
    });

    // Return user data with token
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      roles,
      permissions
    };
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile with roles
 */
const getUserProfile = async (userId) => {
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
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return true;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  changePassword
};