// src/services/entity.service.js
const prisma = require('../config/database');

/**
 * Get all entities with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Entities with pagination
 */
const getAllEntities = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [entities, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      prisma.entity.count({ where })
    ]);

    return {
      entities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getAllEntities:', error);
    throw new Error('Failed to fetch entities');
  }
};

/**
 * Get entity by ID
 * @param {string} id - Entity ID
 * @returns {Promise<Object|null>} Entity or null
 */
const getEntityById = async (id) => {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id }
    });

    return entity;
  } catch (error) {
    console.error('Error in getEntityById:', error);
    throw new Error('Failed to fetch entity');
  }
};

/**
 * Create a new entity
 * @param {Object} entityData - Entity data
 * @param {string} createdById - User ID who created the entity
 * @returns {Promise<Object>} Created entity
 */
const createEntity = async (entityData, createdById) => {
  try {
    // Check if entity with same name or code already exists
    const existingEntity = await prisma.entity.findFirst({
      where: {
        OR: [
          { name: entityData.name },
          { code: entityData.code }
        ]
      }
    });

    if (existingEntity) {
      throw new Error('Entity with this name or code already exists');
    }

    const entity = await prisma.entity.create({
      data: {
        ...entityData
      }
    });

    return entity;
  } catch (error) {
    console.error('Error in createEntity:', error);
    throw error;
  }
};

/**
 * Update an entity
 * @param {string} id - Entity ID
 * @param {Object} updateData - Update data
 * @param {string} modifiedById - User ID making the update
 * @returns {Promise<Object>} Updated entity
 */
const updateEntity = async (id, updateData, modifiedById) => {
  try {
    // Check if entity exists
    const existingEntity = await prisma.entity.findUnique({
      where: { id }
    });

    if (!existingEntity) {
      throw new Error('Entity not found');
    }

    // Check if name or code conflicts with other entities
    if (updateData.name || updateData.code) {
      const conflictingEntity = await prisma.entity.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(updateData.name ? [{ name: updateData.name }] : []),
            ...(updateData.code ? [{ code: updateData.code }] : [])
          ]
        }
      });

      if (conflictingEntity) {
        throw new Error('Entity with this name or code already exists');
      }
    }

    const entity = await prisma.entity.update({
      where: { id },
      data: {
        ...updateData
      }
    });

    return entity;
  } catch (error) {
    console.error('Error in updateEntity:', error);
    throw error;
  }
};

/**
 * Delete an entity
 * @param {string} id - Entity ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteEntity = async (id) => {
  try {
    // Check if entity exists
    const existingEntity = await prisma.entity.findUnique({
      where: { id }
    });

    if (!existingEntity) {
      throw new Error('Entity not found');
    }

    // Check if entity is being used in assignments
    const assignmentsCount = await prisma.jobPostingAssignment.count({
      where: { entityId: id }
    });

    if (assignmentsCount > 0) {
      throw new Error('Cannot delete entity that has job posting assignments');
    }

    // Check if entity is being used by users
    const usersCount = await prisma.user.count({
      where: { entityId: id }
    });

    if (usersCount > 0) {
      throw new Error('Cannot delete entity that has users assigned');
    }

    await prisma.entity.delete({
      where: { id }
    });

    return { success: true, message: 'Entity deleted successfully' };
  } catch (error) {
    console.error('Error in deleteEntity:', error);
    throw error;
  }
};

/**
 * Get entities by type
 * @param {string} type - Entity type
 * @returns {Promise<Array>} List of entities
 */
const getEntitiesByType = async (type) => {
  try {
    const entities = await prisma.entity.findMany({
      where: { 
        type: type,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });

    return entities;
  } catch (error) {
    console.error('Error in getEntitiesByType:', error);
    throw new Error('Failed to fetch entities by type');
  }
};

/**
 * Search entities
 * @param {Object} options - Search options
 * @returns {Promise<Array>} List of matching entities
 */
const searchEntities = async (options = {}) => {
  try {
    const { query, type, isActive } = options;

    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const entities = await prisma.entity.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return entities;
  } catch (error) {
    console.error('Error in searchEntities:', error);
    throw new Error('Failed to search entities');
  }
};

module.exports = {
  getAllEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  searchEntities
};
