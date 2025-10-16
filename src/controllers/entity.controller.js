// src/controllers/entity.controller.js
const EntityService = require('../services/entity.service');

/**
 * Get all entities with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEntities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const result = await EntityService.getAllEntities({
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      message: 'Entities retrieved successfully',
      data: result.entities,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting entities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get entities',
      error: error.message
    });
  }
};

/**
 * Get entity by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntityById = async (req, res) => {
  try {
    const { id } = req.params;
    const entity = await EntityService.getEntityById(id);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }

    res.json({
      success: true,
      message: 'Entity retrieved successfully',
      data: entity
    });
  } catch (error) {
    console.error('Error getting entity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get entity',
      error: error.message
    });
  }
};

/**
 * Create a new entity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEntity = async (req, res) => {
  try {
    const entityData = req.body;
    const createdById = req.user.userId;

    const entity = await EntityService.createEntity(entityData, createdById);

    res.status(201).json({
      success: true,
      message: 'Entity created successfully',
      data: entity
    });
  } catch (error) {
    console.error('Error creating entity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create entity',
      error: error.message
    });
  }
};

/**
 * Update an entity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const modifiedById = req.user.userId;

    const entity = await EntityService.updateEntity(id, updateData, modifiedById);

    res.json({
      success: true,
      message: 'Entity updated successfully',
      data: entity
    });
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update entity',
      error: error.message
    });
  }
};

/**
 * Delete an entity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEntity = async (req, res) => {
  try {
    const { id } = req.params;

    await EntityService.deleteEntity(id);

    res.json({
      success: true,
      message: 'Entity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entity',
      error: error.message
    });
  }
};

/**
 * Get entities by type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const entities = await EntityService.getEntitiesByType(type);

    res.json({
      success: true,
      message: `Entities of type '${type}' retrieved successfully`,
      data: entities
    });
  } catch (error) {
    console.error('Error getting entities by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get entities by type',
      error: error.message
    });
  }
};

/**
 * Search entities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchEntities = async (req, res) => {
  try {
    const { q: query, type, isActive } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const entities = await EntityService.searchEntities({
      query,
      type,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    });

    res.json({
      success: true,
      message: 'Entities search completed',
      data: entities
    });
  } catch (error) {
    console.error('Error searching entities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search entities',
      error: error.message
    });
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
