const EducationService = require('../services/education.service');

const createEducation = async (req, res) => {
  try {
    const {
      candidateId,
      degree,
      institution,
      fieldOfStudy,
      graduationYear,
      gpa,
      isCompleted,
      startYear,
      endYear,
      location,
      description
    } = req.body;

    if (!candidateId || !degree || !institution || !fieldOfStudy) {
      return res.status(400).json({
        success: false,
        message: 'CandidateId, degree, institution, and fieldOfStudy are required'
      });
    }

    const education = await EducationService.createEducation({
      candidateId,
      degree,
      institution,
      fieldOfStudy,
      graduationYear,
      gpa,
      isCompleted,
      startYear,
      endYear,
      location,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Education created successfully',
      data: education
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllEducations = async (req, res) => {
  try {
    const {
      candidateId,
      degree,
      institution,
      fieldOfStudy,
      isCompleted
    } = req.query;

    const filters = {};
    if (candidateId) filters.candidateId = candidateId;
    if (degree) filters.degree = degree;
    if (institution) filters.institution = institution;
    if (fieldOfStudy) filters.fieldOfStudy = fieldOfStudy;
    if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';

    const educations = await EducationService.getAllEducations(filters);

    res.status(200).json({
      success: true,
      message: 'Educations fetched successfully',
      data: educations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getEducationById = async (req, res) => {
  try {
    const { id } = req.params;

    const education = await EducationService.getEducationById(id);

    res.status(200).json({
      success: true,
      message: 'Education fetched successfully',
      data: education
    });
  } catch (error) {
    const statusCode = error.message === 'Education not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      degree,
      institution,
      fieldOfStudy,
      graduationYear,
      gpa,
      isCompleted,
      startYear,
      endYear,
      location,
      description
    } = req.body;

    if (!degree || !institution || !fieldOfStudy) {
      return res.status(400).json({
        success: false,
        message: 'Degree, institution, and fieldOfStudy are required'
      });
    }

    const education = await EducationService.updateEducation(id, {
      degree,
      institution,
      fieldOfStudy,
      graduationYear,
      gpa,
      isCompleted,
      startYear,
      endYear,
      location,
      description
    });

    res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      data: education
    });
  } catch (error) {
    const statusCode = error.message === 'Education not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await EducationService.deleteEducation(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Education not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createEducation,
  getAllEducations,
  getEducationById,
  updateEducation,
  deleteEducation
};
