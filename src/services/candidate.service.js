const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createCandidate = async (data) => {
  try {
    const candidate = await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        isApplicant: data.isApplicant || false,
        skills: data.skills || [],
        experienceYears: data.experienceYears,
        availability: data.availability,
        expectedSalary: data.expectedSalary,
        currentEmployer: data.currentEmployer,
        employmentType: data.employmentType,
        certifications: data.certifications || [],
        resumeUrl: data.resumeUrl,
        linkedinUrl: data.linkedinUrl,
        createdById: data.createdById,
        modifiedById: data.modifiedById,
        isActive: data.isActive !== undefined ? data.isActive : true
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        education: true,
        jobCandidateAssignments: {
          include: {
            job: {
              select: {
                id: true,
                jobCode: true,
                title: true
              }
            },
            stage: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    return candidate;
  } catch (error) {
    throw new Error(`Error creating candidate: ${error.message}`);
  }
};

const getAllCandidates = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.isApplicant !== undefined) {
      where.isApplicant = filters.isApplicant;
    }
    
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          jobCandidateAssignments: {
            take: 5,
            orderBy: { assignedDate: 'desc' },
            include: {
              job: {
                select: {
                  id: true,
                  jobCode: true,
                  title: true,
                  company: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              stage: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      }),
      prisma.candidate.count({ where })
    ]);

    return {
      candidates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error fetching candidates: ${error.message}`);
  }
};

const getCandidateById = async (id) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        education: {
          orderBy: { graduationYear: 'desc' }
        },
        candidateActivities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        jobCandidateAssignments: {
          orderBy: { assignedDate: 'desc' },
          include: {
            job: {
              select: {
                id: true,
                jobCode: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    industry: true,
                    location: true
                  }
                }
              }
            },
            stage: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            assignedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    return candidate;
  } catch (error) {
    throw new Error(`Error fetching candidate: ${error.message}`);
  }
};

const updateCandidate = async (id, data) => {
  try {
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!existingCandidate) {
      throw new Error('Candidate not found');
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        isApplicant: data.isApplicant,
        skills: data.skills,
        experienceYears: data.experienceYears,
        availability: data.availability,
        expectedSalary: data.expectedSalary,
        currentEmployer: data.currentEmployer,
        employmentType: data.employmentType,
        certifications: data.certifications,
        resumeUrl: data.resumeUrl,
        linkedinUrl: data.linkedinUrl,
        modifiedById: data.modifiedById,
        isActive: data.isActive
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        modifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        education: true,
        jobCandidateAssignments: {
          include: {
            job: {
              select: {
                id: true,
                jobCode: true,
                title: true
              }
            },
            stage: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    return candidate;
  } catch (error) {
    throw new Error(`Error updating candidate: ${error.message}`);
  }
};

const deleteCandidate = async (id) => {
  try {
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        candidateActivities: true,
        education: true,
        jobCandidateAssignments: true
      }
    });

    if (!existingCandidate) {
      throw new Error('Candidate not found');
    }

    await prisma.candidate.delete({
      where: { id }
    });

    return { message: 'Candidate deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting candidate: ${error.message}`);
  }
};

const getCandidatesByJobCode = async (jobCode, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [candidates, totalCount] = await Promise.all([
      prisma.candidate.findMany({
        where: {
          job: {
            jobCode: jobCode
          },
          isActive: true
        },
        include: {
          job: {
            select: {
              id: true,
              jobCode: true,
              title: true
            }
          },
          currentStage: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          education: {
            select: {
              id: true,
              degree: true,
              institution: true,
              fieldOfStudy: true,
              graduationYear: true,
              isCompleted: true
            }
          },
          activities: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              activityType: true,
              notes: true,
              fromValue: true,
              toValue: true,
              createdAt: true,
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.candidate.count({
        where: {
          job: {
            jobCode: jobCode
          },
          isActive: true
        }
      })
    ]);

    return {
      candidates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error fetching candidates by job code: ${error.message}`);
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
