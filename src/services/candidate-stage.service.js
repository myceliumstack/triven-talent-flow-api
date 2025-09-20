const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createCandidateStage = async (data) => {
  try {
    const candidateStage = await prisma.candidateStage.create({
      data: {
        name: data.name,
        slug: data.slug,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
    return candidateStage;
  } catch (error) {
    throw new Error(`Error creating candidate stage: ${error.message}`);
  }
};

const getAllCandidateStages = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const candidateStages = await prisma.candidateStage.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    return candidateStages;
  } catch (error) {
    throw new Error(`Error fetching candidate stages: ${error.message}`);
  }
};

const getCandidateStageById = async (id) => {
  try {
    const candidateStage = await prisma.candidateStage.findUnique({
      where: { id },
      include: {
        candidates: {
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
            },
            createdAt: true
          }
        }
      }
    });

    if (!candidateStage) {
      throw new Error('Candidate stage not found');
    }

    return candidateStage;
  } catch (error) {
    throw new Error(`Error fetching candidate stage: ${error.message}`);
  }
};

const updateCandidateStage = async (id, data) => {
  try {
    const existingCandidateStage = await prisma.candidateStage.findUnique({
      where: { id }
    });

    if (!existingCandidateStage) {
      throw new Error('Candidate stage not found');
    }

    const candidateStage = await prisma.candidateStage.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        isActive: data.isActive
      }
    });

    return candidateStage;
  } catch (error) {
    throw new Error(`Error updating candidate stage: ${error.message}`);
  }
};

const deleteCandidateStage = async (id) => {
  try {
    const existingCandidateStage = await prisma.candidateStage.findUnique({
      where: { id },
      include: {
        candidates: true
      }
    });

    if (!existingCandidateStage) {
      throw new Error('Candidate stage not found');
    }

    if (existingCandidateStage.candidates.length > 0) {
      throw new Error('Cannot delete candidate stage that has associated candidates');
    }

    await prisma.candidateStage.delete({
      where: { id }
    });

    return { message: 'Candidate stage deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting candidate stage: ${error.message}`);
  }
};

module.exports = {
  createCandidateStage,
  getAllCandidateStages,
  getCandidateStageById,
  updateCandidateStage,
  deleteCandidateStage
};
