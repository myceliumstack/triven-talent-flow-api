// src/controllers/resume.controller.js
const ResumeService = require('../services/resume.service');
const multer = require('multer');

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * Upload resume for a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadResume = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const modifiedById = req.user?.userId;

    console.log('Upload resume request:', {
      candidateId,
      hasFile: !!req.file,
      fileSize: req.file?.size,
      fileName: req.file?.originalname,
      hasUserId: !!modifiedById
    });

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    if (!modifiedById) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    console.log('Calling ResumeService.uploadResume...');
    const candidate = await ResumeService.uploadResume(
      candidateId,
      req.file.buffer,
      req.file.originalname,
      modifiedById
    );
    console.log('Resume uploaded successfully for candidate:', candidateId);

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and converted successfully',
      data: {
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          resumeUrl: candidate.resumeUrl,
          hasResume: !!candidate.resume,
          updatedAt: candidate.updatedAt,
          modifiedBy: candidate.modifiedBy
        },
        originalFileName: req.file.originalname,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading resume:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      candidateId: req.params?.candidateId
    });
    
    if (error.message === 'Candidate not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload resume',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get resume for a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getResume = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    const candidate = await ResumeService.getResume(candidateId);

    res.status(200).json({
      success: true,
      message: 'Resume fetched successfully',
      data: {
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          resumeUrl: candidate.resumeUrl,
          updatedAt: candidate.updatedAt,
          modifiedBy: candidate.modifiedBy
        },
        resume: candidate.resume
      }
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    
    if (error.message === 'Candidate not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Resume not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
      error: error.message
    });
  }
};

/**
 * Delete resume for a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteResume = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const modifiedById = req.user?.userId;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    if (!modifiedById) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const candidate = await ResumeService.deleteResume(candidateId, modifiedById);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      data: {
        candidate: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          resumeDeleted: true,
          updatedAt: candidate.updatedAt,
          modifiedBy: candidate.modifiedBy
        }
      }
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    
    if (error.message === 'Candidate not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message
    });
  }
};

/**
 * Check if candidate has a resume
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkResume = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    const hasResume = await ResumeService.hasResume(candidateId);

    res.status(200).json({
      success: true,
      message: 'Resume status checked successfully',
      data: {
        candidateId,
        hasResume
      }
    });
  } catch (error) {
    console.error('Error checking resume:', error);
    
    if (error.message === 'Candidate not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to check resume status',
      error: error.message
    });
  }
};

module.exports = {
  uploadResume,
  getResume,
  deleteResume,
  checkResume,
  upload
};

