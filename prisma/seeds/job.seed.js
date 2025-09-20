const { PrismaClient } = require('@prisma/client');
const { generateJobCode } = require('../../src/utils/job-code.utils');

const prisma = new PrismaClient();

async function seedJobs() {
  console.log('🌱 Seeding jobs...');
  
  try {
    // Get required data for jobs
    const companies = await prisma.company.findMany({ take: 3 });
    const jobStatuses = await prisma.jobStatus.findMany({ take: 3 });
    const jobPostings = await prisma.jobPosting.findMany({ take: 2 });
    const users = await prisma.user.findMany({ take: 2 });

    if (companies.length === 0 || jobStatuses.length === 0 || users.length === 0) {
      console.log('⚠️  Skipping job seeding - required data not found');
      return;
    }

    const jobs = [
      {
        jobCode: generateJobCode(),
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full-stack developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
        location: 'San Francisco, CA',
        remoteType: 'hybrid',
        timeZone: 'America/Los_Angeles',
        minSalary: 120000,
        maxSalary: 180000,
        salaryCurrency: 'USD',
        salaryNotes: 'Plus equity and benefits',
        feePercentage: 20.00,
        paymentTerms: 'Net 30',
        relocationAssistance: true,
        relocationDetails: 'Up to $10,000 relocation assistance provided',
        warrantyType: 'Replacement',
        warrantyPeriodDays: 90,
        skills: {
          required: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
          preferred: ['TypeScript', 'AWS', 'Docker', 'GraphQL']
        },
        booleanSearch: '(JavaScript OR TypeScript) AND (React OR Vue OR Angular) AND (Node.js OR Express)',
        tags: ['senior', 'full-stack', 'remote-friendly', 'startup'],
        companyId: companies[0].id,
        jobPostingId: jobPostings[0]?.id,
        statusId: jobStatuses[0].id,
        createdById: users[0].id,
        isActive: true,
        postingMeta: {
          linkedin: 'https://linkedin.com/jobs/view/123456',
          indeed: 'https://indeed.com/viewjob?jk=789012'
        },
        candidateCount: 0,
        notes: 'High priority position. Looking for someone who can start immediately.'
      },
      {
        jobCode: generateJobCode(),
        title: 'DevOps Engineer',
        description: 'Join our infrastructure team to help scale our cloud infrastructure and improve our deployment processes.',
        location: 'New York, NY',
        remoteType: 'remote',
        timeZone: 'America/New_York',
        minSalary: 100000,
        maxSalary: 150000,
        salaryCurrency: 'USD',
        salaryNotes: 'Competitive salary with stock options',
        feePercentage: 18.00,
        paymentTerms: 'Net 15',
        relocationAssistance: false,
        warrantyType: 'Refund',
        warrantyPeriodDays: 60,
        skills: {
          required: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
          preferred: ['Python', 'Jenkins', 'Prometheus', 'Grafana']
        },
        booleanSearch: '(AWS OR Azure OR GCP) AND (Docker OR Kubernetes) AND (Terraform OR CloudFormation)',
        tags: ['devops', 'cloud', 'infrastructure', 'remote'],
        companyId: companies[1]?.id || companies[0].id,
        jobPostingId: jobPostings[1]?.id,
        statusId: jobStatuses[1].id,
        createdById: users[1]?.id || users[0].id,
        isActive: true,
        postingMeta: {
          linkedin: 'https://linkedin.com/jobs/view/234567',
          glassdoor: 'https://glassdoor.com/job-listing/345678'
        },
        candidateCount: 0,
        notes: 'Looking for someone with strong AWS experience.'
      },
      {
        jobCode: generateJobCode(),
        title: 'Frontend Developer',
        description: 'We need a creative frontend developer to build beautiful and responsive user interfaces for our web applications.',
        location: 'Austin, TX',
        remoteType: 'onsite',
        timeZone: 'America/Chicago',
        minSalary: 80000,
        maxSalary: 120000,
        salaryCurrency: 'USD',
        salaryNotes: 'Great benefits package included',
        feePercentage: 15.00,
        paymentTerms: 'Net 30',
        relocationAssistance: true,
        relocationDetails: 'Relocation assistance up to $5,000',
        warrantyType: 'Replacement',
        warrantyPeriodDays: 90,
        skills: {
          required: ['HTML', 'CSS', 'JavaScript', 'React'],
          preferred: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Figma']
        },
        booleanSearch: '(React OR Vue OR Angular) AND (CSS OR SCSS OR Tailwind) AND (JavaScript OR TypeScript)',
        tags: ['frontend', 'ui-ux', 'react', 'onsite'],
        companyId: companies[2]?.id || companies[0].id,
        statusId: jobStatuses[2].id,
        createdById: users[0].id,
        isActive: true,
        postingMeta: {
          linkedin: 'https://linkedin.com/jobs/view/345678'
        },
        candidateCount: 0,
        notes: 'Perfect for someone who loves creating beautiful user experiences.'
      }
    ];

    for (const job of jobs) {
      await prisma.job.upsert({
        where: { jobCode: job.jobCode },
        update: job,
        create: job
      });
    }
    
    console.log(`✅ Seeded ${jobs.length} jobs`);
  } catch (error) {
    console.error('❌ Error seeding jobs:', error);
    throw error;
  }
}

module.exports = { seedJobs };
