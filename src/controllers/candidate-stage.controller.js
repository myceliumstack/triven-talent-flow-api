const CandidateStageService = require('../services/candidate-stage.service');

const createCandidateStage = async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    const candidateStage = await CandidateStageService.createCandidateStage({
      name,
      slug,
      isActive
    });

    res.status(201).json({
      success: true,
      message: 'Candidate stage created successfully',
      data: candidateStage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllCandidateStages = async (req, res) => {
  try {
    const { isActive, search } = req.query;

    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    if (search) {
      filters.search = search;
    }

    const candidateStages = await CandidateStageService.getAllCandidateStages(filters);

    res.status(200).json({
      success: true,
      message: 'Candidate stages fetched successfully',
      data: candidateStages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getCandidateStageById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidateStage = await CandidateStageService.getCandidateStageById(id);

    res.status(200).json({
      success: true,
      message: 'Candidate stage fetched successfully',
      data: candidateStage
    });
  } catch (error) {
    const statusCode = error.message === 'Candidate stage not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const updateCandidateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, isActive } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    const candidateStage = await CandidateStageService.updateCandidateStage(id, {
      name,
      slug,
      isActive
    });

    res.status(200).json({
      success: true,
      message: 'Candidate stage updated successfully',
      data: candidateStage
    });
  } catch (error) {
    const statusCode = error.message === 'Candidate stage not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCandidateStage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await CandidateStageService.deleteCandidateStage(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Candidate stage not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCandidateStage,
  getAllCandidateStages,
  getCandidateStageById,
  updateCandidateStage,
  deleteCandidateStage
};
