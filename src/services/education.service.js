const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createEducation = async (data) => {
  try {
    const education = await prisma.education.create({
      data: {
        candidateId: data.candidateId,
        degree: data.degree,
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy,
        graduationYear: data.graduationYear,
        gpa: data.gpa,
        isCompleted: data.isCompleted !== undefined ? data.isCompleted : true,
        startYear: data.startYear,
        endYear: data.endYear,
        location: data.location,
        description: data.description
      }
    });
    return education;
  } catch (error) {
    throw new Error(`Error creating education: ${error.message}`);
  }
};

const getAllEducations = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.candidateId) {
      where.candidateId = filters.candidateId;
    }
    
    if (filters.degree) {
      where.degree = {
        contains: filters.degree,
        mode: 'insensitive'
      };
    }
    
    if (filters.institution) {
      where.institution = {
        contains: filters.institution,
        mode: 'insensitive'
      };
    }
    
    if (filters.fieldOfStudy) {
      where.fieldOfStudy = {
        contains: filters.fieldOfStudy,
        mode: 'insensitive'
      };
    }
    
    if (filters.isCompleted !== undefined) {
      where.isCompleted = filters.isCompleted;
    }

    const educations = await prisma.education.findMany({
      where,
      orderBy: { graduationYear: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return educations;
  } catch (error) {
    throw new Error(`Error fetching educations: ${error.message}`);
  }
};

const getEducationById = async (id) => {
  try {
    const education = await prisma.education.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            job: {
              select: {
                id: true,
                jobCode: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!education) {
      throw new Error('Education not found');
    }

    return education;
  } catch (error) {
    throw new Error(`Error fetching education: ${error.message}`);
  }
};

const updateEducation = async (id, data) => {
  try {
    const existingEducation = await prisma.education.findUnique({
      where: { id }
    });

    if (!existingEducation) {
      throw new Error('Education not found');
    }

    const education = await prisma.education.update({
      where: { id },
      data: {
        degree: data.degree,
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy,
        graduationYear: data.graduationYear,
        gpa: data.gpa,
        isCompleted: data.isCompleted,
        startYear: data.startYear,
        endYear: data.endYear,
        location: data.location,
        description: data.description
      }
    });

    return education;
  } catch (error) {
    throw new Error(`Error updating education: ${error.message}`);
  }
};

const deleteEducation = async (id) => {
  try {
    const existingEducation = await prisma.education.findUnique({
      where: { id }
    });

    if (!existingEducation) {
      throw new Error('Education not found');
    }

    await prisma.education.delete({
      where: { id }
    });

    return { message: 'Education deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting education: ${error.message}`);
  }
};

module.exports = {
  createEducation,
  getAllEducations,
  getEducationById,
  updateEducation,
  deleteEducation
};
