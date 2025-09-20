const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCandidates() {
  console.log('🌱 Seeding candidates...');
  
  try {
    // Get required data for candidates
    const jobs = await prisma.job.findMany({ take: 3 });
    const candidateStages = await prisma.candidateStage.findMany({ take: 5 });
    const users = await prisma.user.findMany({ take: 2 });

    if (jobs.length === 0 || candidateStages.length === 0 || users.length === 0) {
      console.log('⚠️  Skipping candidate seeding - required data not found');
      return;
    }

    const candidates = [
      {
        jobId: jobs[0].id,
        currentStageId: candidateStages[0].id, // Applied
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        isApplicant: true,
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        experienceYears: 5,
        availability: '2 weeks',
        expectedSalary: 150000,
        currentEmployer: 'Tech Corp',
        employmentType: 'Full-time',
        certifications: ['AWS Certified Developer', 'React Professional'],
        resumeUrl: 'https://example.com/resumes/john-smith.pdf',
        linkedInUrl: 'https://linkedin.com/in/johnsmith',
        createdById: users[0].id,
        isActive: true
      },
      {
        jobId: jobs[0].id,
        currentStageId: candidateStages[1].id, // Screening
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0124',
        location: 'Seattle, WA',
        isApplicant: false,
        skills: ['TypeScript', 'React', 'Node.js', 'MongoDB', 'Docker'],
        experienceYears: 4,
        availability: 'Immediate',
        expectedSalary: 140000,
        currentEmployer: 'StartupXYZ',
        employmentType: 'Full-time',
        certifications: ['Google Cloud Professional'],
        resumeUrl: 'https://example.com/resumes/sarah-johnson.pdf',
        linkedInUrl: 'https://linkedin.com/in/sarahjohnson',
        createdById: users[1]?.id || users[0].id,
        isActive: true
      },
      {
        jobId: jobs[1]?.id || jobs[0].id,
        currentStageId: candidateStages[2].id, // Phone Interview
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@email.com',
        phone: '+1-555-0125',
        location: 'New York, NY',
        isApplicant: true,
        skills: ['Python', 'AWS', 'Docker', 'Kubernetes', 'Terraform'],
        experienceYears: 6,
        availability: '1 month',
        expectedSalary: 130000,
        currentEmployer: 'CloudTech Inc',
        employmentType: 'Full-time',
        certifications: ['AWS Solutions Architect', 'Kubernetes Administrator'],
        resumeUrl: 'https://example.com/resumes/mike-chen.pdf',
        linkedInUrl: 'https://linkedin.com/in/mikechen',
        createdById: users[0].id,
        isActive: true
      },
      {
        jobId: jobs[2]?.id || jobs[0].id,
        currentStageId: candidateStages[3].id, // Technical Interview
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0126',
        location: 'Austin, TX',
        isApplicant: true,
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Figma'],
        experienceYears: 3,
        availability: '3 weeks',
        expectedSalary: 95000,
        currentEmployer: 'Design Studio',
        employmentType: 'Full-time',
        certifications: ['Adobe Certified Expert'],
        resumeUrl: 'https://example.com/resumes/emily-davis.pdf',
        linkedInUrl: 'https://linkedin.com/in/emilydavis',
        createdById: users[1]?.id || users[0].id,
        isActive: true
      },
      {
        jobId: jobs[0].id,
        currentStageId: candidateStages[4].id, // HR Interview
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '+1-555-0127',
        location: 'Los Angeles, CA',
        isApplicant: false,
        skills: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Redis'],
        experienceYears: 7,
        availability: '2 weeks',
        expectedSalary: 160000,
        currentEmployer: 'Enterprise Solutions',
        employmentType: 'Full-time',
        certifications: ['Oracle Certified Professional'],
        resumeUrl: 'https://example.com/resumes/david-wilson.pdf',
        linkedInUrl: 'https://linkedin.com/in/davidwilson',
        createdById: users[0].id,
        isActive: true
      }
    ];

    for (const candidate of candidates) {
      await prisma.candidate.create({
        data: candidate
      });
    }
    
    console.log(`✅ Seeded ${candidates.length} candidates`);
  } catch (error) {
    console.error('❌ Error seeding candidates:', error);
    throw error;
  }
}

module.exports = { seedCandidates };
