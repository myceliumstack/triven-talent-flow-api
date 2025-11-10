const JobService = require('../services/job.service');

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      remoteType,
      timeZone,
      minSalary,
      maxSalary,
      salaryCurrency,
      salaryNotes,
      feePercentage,
      paymentTerms,
      relocationAssistance,
      relocationDetails,
      warrantyType,
      warrantyPeriodDays,
      skills,
      booleanSearch,
      tags,
      companyId,
      jobPostingId,
      postingMeta,
      candidateCount,
      notes
    } = req.body;

    if (!title || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Title and companyId are required'
      });
    }

    const job = await JobService.createJob({
      title,
      description,
      location,
      remoteType,
      timeZone,
      minSalary,
      maxSalary,
      salaryCurrency,
      salaryNotes,
      feePercentage,
      paymentTerms,
      relocationAssistance,
      relocationDetails,
      warrantyType,
      warrantyPeriodDays,
      skills,
      booleanSearch,
      tags,
      companyId,
      jobPostingId,
      createdById: req.user.userId,
      postingMeta,
      candidateCount,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const {
      companyId,
      statusId,
      jobPostingId,
      isActive,
      search,
      location,
      remoteType,
      createdById,
      page,
      limit
    } = req.query;

    const filters = {};
    if (companyId) filters.companyId = companyId;
    if (statusId) filters.statusId = statusId;
    if (jobPostingId) filters.jobPostingId = jobPostingId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search;
    if (location) filters.location = location;
    if (remoteType) filters.remoteType = remoteType;
    if (createdById) filters.createdById = createdById;
    if (page) filters.page = page;
    if (limit) filters.limit = limit;

    const result = await JobService.getAllJobs(filters);

    res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: result.jobs,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const searchJobsByCode = async (req, res) => {
  try {
    const { jobCode } = req.params;
    const { companyId, isActive, page, limit } = req.query;

    const result = await JobService.searchJobsByCode(jobCode, {
      companyId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: result.jobs,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobService.getJobById(id);

    res.status(200).json({
      success: true,
      message: 'Job fetched successfully',
      data: job
    });
  } catch (error) {
    const statusCode = error.message === 'Job not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const getJobByCode = async (req, res) => {
  try {
    const { jobCode } = req.params;

    const job = await JobService.getJobByCode(jobCode);

    res.status(200).json({
      success: true,
      message: 'Job fetched successfully',
      data: job
    });
  } catch (error) {
    const statusCode = error.message === 'Job not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const getJobsByCreatedBy = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const filters = {
      createdById: userId,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await JobService.getAllJobs(filters);

    res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: result.jobs,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      remoteType,
      timeZone,
      minSalary,
      maxSalary,
      salaryCurrency,
      salaryNotes,
      feePercentage,
      paymentTerms,
      relocationAssistance,
      relocationDetails,
      warrantyType,
      warrantyPeriodDays,
      skills,
      booleanSearch,
      tags,
      companyId,
      jobPostingId,
      isActive,
      postingMeta,
      candidateCount,
      notes
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const job = await JobService.updateJob(id, {
      title,
      description,
      location,
      remoteType,
      timeZone,
      minSalary,
      maxSalary,
      salaryCurrency,
      salaryNotes,
      feePercentage,
      paymentTerms,
      relocationAssistance,
      relocationDetails,
      warrantyType,
      warrantyPeriodDays,
      skills,
      booleanSearch,
      tags,
      companyId,
      jobPostingId,
      modifiedById: req.user.userId,
      isActive,
      postingMeta,
      candidateCount,
      notes
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    const statusCode = error.message === 'Job not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await JobService.deleteJob(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Job not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getJobByCode,
   searchJobsByCode,
  getJobsByCreatedBy,
  updateJob,
  deleteJob
};
