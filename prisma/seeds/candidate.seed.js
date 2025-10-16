const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const candidates = [
  {
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
    linkedInUrl: 'https://linkedin.com/in/johnsmith'
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0124',
    location: 'New York, NY',
    isApplicant: true,
    skills: ['Python', 'Django', 'Machine Learning', 'TensorFlow', 'SQL'],
    experienceYears: 4,
    availability: '1 month',
    expectedSalary: 120000,
    currentEmployer: 'Data Corp',
    employmentType: 'Full-time',
    certifications: ['Google Cloud Professional', 'TensorFlow Developer'],
    resumeUrl: 'https://example.com/resumes/sarah-johnson.pdf',
    linkedInUrl: 'https://linkedin.com/in/sarahjohnson'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0125',
    location: 'Seattle, WA',
    isApplicant: false,
    skills: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes'],
    experienceYears: 7,
    availability: '3 weeks',
    expectedSalary: 140000,
    currentEmployer: 'Cloud Solutions Inc',
    employmentType: 'Full-time',
    certifications: ['AWS Solutions Architect', 'Kubernetes Administrator'],
    resumeUrl: 'https://example.com/resumes/michael-chen.pdf',
    linkedInUrl: 'https://linkedin.com/in/michaelchen'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@email.com',
    phone: '+1-555-0126',
    location: 'Austin, TX',
    isApplicant: true,
    skills: ['React', 'TypeScript', 'GraphQL', 'Apollo', 'Jest'],
    experienceYears: 3,
    availability: '2 weeks',
    expectedSalary: 100000,
    currentEmployer: 'StartupXYZ',
    employmentType: 'Full-time',
    certifications: ['React Professional', 'TypeScript Developer'],
    resumeUrl: 'https://example.com/resumes/emily-davis.pdf',
    linkedInUrl: 'https://linkedin.com/in/emilydavis'
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '+1-555-0127',
    location: 'Chicago, IL',
    isApplicant: true,
    skills: ['C#', '.NET', 'Azure', 'SQL Server', 'Entity Framework'],
    experienceYears: 6,
    availability: '1 month',
    expectedSalary: 130000,
    currentEmployer: 'Enterprise Corp',
    employmentType: 'Full-time',
    certifications: ['Microsoft Azure Developer', 'Microsoft Certified Professional'],
    resumeUrl: 'https://example.com/resumes/david-wilson.pdf',
    linkedInUrl: 'https://linkedin.com/in/davidwilson'
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1-555-0128',
    location: 'Miami, FL',
    isApplicant: false,
    skills: ['Vue.js', 'Nuxt.js', 'Node.js', 'MongoDB', 'Redis'],
    experienceYears: 4,
    availability: '2 weeks',
    expectedSalary: 110000,
    currentEmployer: 'Web Solutions LLC',
    employmentType: 'Full-time',
    certifications: ['Vue.js Professional', 'MongoDB Developer'],
    resumeUrl: 'https://example.com/resumes/lisa-anderson.pdf',
    linkedInUrl: 'https://linkedin.com/in/lisaanderson'
  },
  {
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@email.com',
    phone: '+1-555-0129',
    location: 'Denver, CO',
    isApplicant: true,
    skills: ['Angular', 'RxJS', 'NgRx', 'TypeScript', 'Jasmine'],
    experienceYears: 5,
    availability: '3 weeks',
    expectedSalary: 125000,
    currentEmployer: 'Frontend Corp',
    employmentType: 'Full-time',
    certifications: ['Angular Professional', 'TypeScript Advanced'],
    resumeUrl: 'https://example.com/resumes/james-brown.pdf',
    linkedInUrl: 'https://linkedin.com/in/jamesbrown'
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1-555-0130',
    location: 'Portland, OR',
    isApplicant: true,
    skills: ['Python', 'Flask', 'Django', 'PostgreSQL', 'Celery'],
    experienceYears: 3,
    availability: '1 month',
    expectedSalary: 95000,
    currentEmployer: 'Python Solutions',
    employmentType: 'Full-time',
    certifications: ['Python Professional', 'Django Developer'],
    resumeUrl: 'https://example.com/resumes/maria-garcia.pdf',
    linkedInUrl: 'https://linkedin.com/in/mariagarcia'
  },
  {
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1-555-0131',
    location: 'Boston, MA',
    isApplicant: false,
    skills: ['Go', 'Gin', 'Docker', 'Kubernetes', 'gRPC'],
    experienceYears: 6,
    availability: '2 weeks',
    expectedSalary: 135000,
    currentEmployer: 'Go Solutions Inc',
    employmentType: 'Full-time',
    certifications: ['Go Professional', 'Kubernetes Administrator'],
    resumeUrl: 'https://example.com/resumes/robert-taylor.pdf',
    linkedInUrl: 'https://linkedin.com/in/roberttaylor'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@email.com',
    phone: '+1-555-0132',
    location: 'Phoenix, AZ',
    isApplicant: true,
    skills: ['Ruby', 'Rails', 'RSpec', 'PostgreSQL', 'Redis'],
    experienceYears: 4,
    availability: '3 weeks',
    expectedSalary: 115000,
    currentEmployer: 'Ruby Corp',
    employmentType: 'Full-time',
    certifications: ['Ruby Professional', 'Rails Developer'],
    resumeUrl: 'https://example.com/resumes/jennifer-martinez.pdf',
    linkedInUrl: 'https://linkedin.com/in/jennifermartinez'
  }
];

async function seedCandidates() {
  try {
    console.log('🌱 Seeding candidates...');
    
    // Get the first user as createdBy
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      throw new Error('No users found. Please seed users first.');
    }
    
    for (const candidate of candidates) {
      // Check if candidate already exists
      const existingCandidate = await prisma.candidate.findFirst({
        where: { email: candidate.email }
      });
      
      if (!existingCandidate) {
        await prisma.candidate.create({
          data: {
            ...candidate,
            createdById: firstUser.id
          }
        });
      }
    }
    
    console.log(`✅ Seeded ${candidates.length} candidates`);
  } catch (error) {
    console.error('❌ Error seeding candidates:', error);
    throw error;
  }
}

module.exports = { seedCandidates };