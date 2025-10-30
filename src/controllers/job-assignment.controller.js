const jobAssignmentService = require('../services/job-assignment.service');

// Create a new job assignment
const createJobAssignment = async (req, res) => {
  try {
    const { jobId, assignedUserId, statusId, assignedById, priority, notes } = req.body;

    // Validation
    if (!jobId || !assignedUserId || !statusId || !assignedById) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: jobId, assignedUserId, statusId, assignedById',
      });
    }

    const result = await jobAssignmentService.createJobAssignment({
      jobId,
      assignedUserId,
      statusId,
      assignedById,
      priority,
      notes,
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in createJobAssignment controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get all job assignments with pagination and filters
const getAllJobAssignments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      jobId,
      assignedUserId,
      statusId,
      assignedById,
      priority,
      search,
      sortBy = 'assignedAt',
      sortOrder = 'desc',
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      jobId,
      assignedUserId,
      statusId,
      assignedById,
      priority,
      search,
      sortBy,
      sortOrder,
    };

    const result = await jobAssignmentService.getAllJobAssignments(options);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in getAllJobAssignments controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get job assignment by ID
const getJobAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Job assignment ID is required',
      });
    }

    const result = await jobAssignmentService.getJobAssignmentById(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in getJobAssignmentById controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Update job assignment
const updateJobAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedUserId, statusId, priority, notes } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Job assignment ID is required',
      });
    }

    const updateData = {};
    if (assignedUserId !== undefined) updateData.assignedUserId = assignedUserId;
    if (statusId !== undefined) updateData.statusId = statusId;
    if (priority !== undefined) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    const result = await jobAssignmentService.updateJobAssignment(id, updateData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in updateJobAssignment controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Delete job assignment
const deleteJobAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Job assignment ID is required',
      });
    }

    const result = await jobAssignmentService.deleteJobAssignment(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in deleteJobAssignment controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get job assignments by job ID
const getJobAssignmentsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    const result = await jobAssignmentService.getJobAssignmentsByJobId(jobId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in getJobAssignmentsByJobId controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get job assignments by user ID
const getJobAssignmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const result = await jobAssignmentService.getJobAssignmentsByUserId(userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in getJobAssignmentsByUserId controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  createJobAssignment,
  getAllJobAssignments,
  getJobAssignmentById,
  updateJobAssignment,
  deleteJobAssignment,
  getJobAssignmentsByJobId,
  getJobAssignmentsByUserId,
};
