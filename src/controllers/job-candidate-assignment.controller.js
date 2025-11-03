const JobCandidateAssignmentService = require('../services/job-candidate-assignment.service');

const createJobCandidateAssignment = async (req, res) => {
  try {
    const {
      jobId,
      candidateId,
      // stageId is not required; default will be set to 'new-application'
      status,
      priority,
      source,
      referralSource,
      applicationDate,
      notes
    } = req.body;

    if (!jobId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: 'jobId and candidateId are required'
      });
    }

    const assignment = await JobCandidateAssignmentService.createJobCandidateAssignment({
      jobId,
      candidateId,
      status,
      priority,
      source,
      referralSource,
      applicationDate,
      notes,
      assignedById: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Job candidate assignment created successfully',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllJobCandidateAssignments = async (req, res) => {
  try {
    const {
      jobId,
      candidateId,
      stageId,
      status,
      priority,
      isActive,
      page,
      limit
    } = req.query;

    const filters = {};
    if (jobId) filters.jobId = jobId;
    if (candidateId) filters.candidateId = candidateId;
    if (stageId) filters.stageId = stageId;
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (page) filters.page = page;
    if (limit) filters.limit = limit;

    const result = await JobCandidateAssignmentService.getAllJobCandidateAssignments(filters);

    res.status(200).json({
      success: true,
      message: 'Job candidate assignments fetched successfully',
      data: result.assignments,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getJobCandidateAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await JobCandidateAssignmentService.getJobCandidateAssignmentById(id);

    res.status(200).json({
      success: true,
      message: 'Job candidate assignment fetched successfully',
      data: assignment
    });
  } catch (error) {
    const statusCode = error.message === 'Job candidate assignment not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const updateJobCandidateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      stageId,
      status,
      priority,
      source,
      referralSource,
      applicationDate,
      notes,
      isActive
    } = req.body;

    const assignment = await JobCandidateAssignmentService.updateJobCandidateAssignment(id, {
      stageId,
      status,
      priority,
      source,
      referralSource,
      applicationDate,
      notes,
      isActive,
      modifiedById: req.user.userId
    });

    res.status(200).json({
      success: true,
      message: 'Job candidate assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    const statusCode = error.message === 'Job candidate assignment not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteJobCandidateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    await JobCandidateAssignmentService.deleteJobCandidateAssignment(id);

    res.status(200).json({
      success: true,
      message: 'Job candidate assignment deleted successfully'
    });
  } catch (error) {
    const statusCode = error.message === 'Job candidate assignment not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update stageId for a job candidate assignment (PATCH endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStageId = async (req, res) => {
  try {
    const { id } = req.params;
    const { stageId } = req.body;

    if (!stageId) {
      return res.status(400).json({
        success: false,
        message: 'stageId is required'
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const assignment = await JobCandidateAssignmentService.updateStageId(
      id,
      stageId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: 'Stage ID updated successfully',
      data: assignment
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === 'Job candidate assignment not found' || 
        error.message === 'Candidate stage not found') {
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createJobCandidateAssignment,
  getAllJobCandidateAssignments,
  getJobCandidateAssignmentById,
  updateJobCandidateAssignment,
  deleteJobCandidateAssignment,
  updateStageId
};

