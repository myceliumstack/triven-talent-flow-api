const JobStatusService = require('../services/job-status.service');

const createJobStatus = async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    const jobStatus = await JobStatusService.createJobStatus({
      name,
      slug,
      isActive
    });

    res.status(201).json({
      success: true,
      message: 'Job status created successfully',
      data: jobStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllJobStatuses = async (req, res) => {
  try {
    const { isActive, search } = req.query;

    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    if (search) {
      filters.search = search;
    }

    const jobStatuses = await JobStatusService.getAllJobStatuses(filters);

    res.status(200).json({
      success: true,
      message: 'Job statuses fetched successfully',
      data: jobStatuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getJobStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobStatus = await JobStatusService.getJobStatusById(id);

    res.status(200).json({
      success: true,
      message: 'Job status fetched successfully',
      data: jobStatus
    });
  } catch (error) {
    const statusCode = error.message === 'Job status not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, isActive } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    const jobStatus = await JobStatusService.updateJobStatus(id, {
      name,
      slug,
      isActive
    });

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: jobStatus
    });
  } catch (error) {
    const statusCode = error.message === 'Job status not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteJobStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await JobStatusService.deleteJobStatus(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Job status not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createJobStatus,
  getAllJobStatuses,
  getJobStatusById,
  updateJobStatus,
  deleteJobStatus
};
