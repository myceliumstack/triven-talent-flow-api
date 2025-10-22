const CandidateService = require('../services/candidate.service');

const createCandidate = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      isApplicant,
      skills,
      experienceYears,
      availability,
      expectedSalary,
      currentEmployer,
      employmentType,
      certifications,
      resumeUrl,
      linkedinUrl
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'firstName and lastName are required'
      });
    }

    const candidate = await CandidateService.createCandidate({
      firstName,
      lastName,
      email,
      phone,
      location,
      isApplicant,
      skills,
      experienceYears,
      availability,
      expectedSalary,
      currentEmployer,
      employmentType,
      certifications,
      resumeUrl,
      linkedinUrl,
      createdById: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllCandidates = async (req, res) => {
  try {
    const {
      isActive,
      isApplicant,
      search,
      location,
      employmentType,
      page,
      limit
    } = req.query;

    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isApplicant !== undefined) filters.isApplicant = isApplicant === 'true';
    if (search) filters.search = search;
    if (location) filters.location = location;
    if (employmentType) filters.employmentType = employmentType;
    if (page) filters.page = page;
    if (limit) filters.limit = limit;

    const result = await CandidateService.getAllCandidates(filters);

    res.status(200).json({
      success: true,
      message: 'Candidates fetched successfully',
      data: result.candidates,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await CandidateService.getCandidateById(id);

    res.status(200).json({
      success: true,
      message: 'Candidate fetched successfully',
      data: candidate
    });
  } catch (error) {
    const statusCode = error.message === 'Candidate not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      jobId,
      currentStageId,
      firstName,
      lastName,
      email,
      phone,
      location,
      isApplicant,
      skills,
      experienceYears,
      availability,
      expectedSalary,
      currentEmployer,
      employmentType,
      certifications,
      resumeUrl,
      linkedInUrl,
      isActive
    } = req.body;

    if (!jobId || !currentStageId || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'JobId, currentStageId, firstName, and lastName are required'
      });
    }

    const candidate = await CandidateService.updateCandidate(id, {
      jobId,
      currentStageId,
      firstName,
      lastName,
      email,
      phone,
      location,
      isApplicant,
      skills,
      experienceYears,
      availability,
      expectedSalary,
      currentEmployer,
      employmentType,
      certifications,
      resumeUrl,
      linkedInUrl,
      modifiedById: req.user.userId,
      isActive
    });

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate
    });
  } catch (error) {
    const statusCode = error.message === 'Candidate not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await CandidateService.deleteCandidate(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Candidate not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const getCandidatesByJobCode = async (req, res) => {
  try {
    const { jobCode } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!jobCode) {
      return res.status(400).json({
        success: false,
        message: 'Job code is required'
      });
    }

    const result = await CandidateService.getCandidatesByJobCode(jobCode, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      message: 'Candidates fetched successfully',
      data: result.candidates,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  getCandidatesByJobCode,
  updateCandidate,
  deleteCandidate
};
