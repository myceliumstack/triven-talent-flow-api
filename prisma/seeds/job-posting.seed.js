// prisma/seeds/job-posting.seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedJobPostings(companies) {
  console.log('💼 Seeding job postings...');

  // Clear existing job postings
  await prisma.jobPosting.deleteMany();

  const jobPostings = [
    // TechCorp Solutions Job Postings
    {
      companyId: companies[0].id,
      companyName: 'TechCorp Solutions',
      title: 'Senior Full Stack Developer',
      location: 'San Francisco, CA',
      jobLink: 'https://techcorp.com/careers/senior-fullstack-dev',
      category: 'Software Development',
      experienceRange: '5-8 years',
      salaryRange: '$120,000 - $160,000',
      description: 'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies including React, Node.js, and cloud platforms.',
      sourceUrl: 'https://techcorp.com/careers',
      timeZone: 'PST',
      additionalNotes: 'Remote work available. Must have experience with AWS and Docker.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM001',
      status: 'ACTIVE'
    },
    {
      companyId: companies[0].id,
      companyName: 'TechCorp Solutions',
      title: 'DevOps Engineer',
      location: 'San Francisco, CA',
      jobLink: 'https://techcorp.com/careers/devops-engineer',
      category: 'DevOps',
      experienceRange: '3-6 years',
      salaryRange: '$100,000 - $140,000',
      description: 'Join our DevOps team to help build and maintain our cloud infrastructure. Experience with Kubernetes, Terraform, and CI/CD pipelines required.',
      sourceUrl: 'https://techcorp.com/careers',
      timeZone: 'PST',
      additionalNotes: 'On-site position. Benefits include health insurance and stock options.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM001',
      status: 'ACTIVE'
    },

    // Global Finance Inc Job Postings
    {
      companyId: companies[1].id,
      companyName: 'Global Finance Inc',
      title: 'Financial Analyst',
      location: 'New York, NY',
      jobLink: 'https://globalfinance.com/careers/financial-analyst',
      category: 'Finance',
      experienceRange: '2-4 years',
      salaryRange: '$80,000 - $110,000',
      description: 'We are seeking a Financial Analyst to support our investment banking division. Strong analytical skills and knowledge of financial modeling required.',
      sourceUrl: 'https://globalfinance.com/careers',
      timeZone: 'EST',
      additionalNotes: 'CFA certification preferred. Fast-paced environment.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM002',
      status: 'ACTIVE'
    },
    {
      companyId: companies[1].id,
      companyName: 'Global Finance Inc',
      title: 'Risk Manager',
      location: 'New York, NY',
      jobLink: 'https://globalfinance.com/careers/risk-manager',
      category: 'Risk Management',
      experienceRange: '5-8 years',
      salaryRange: '$130,000 - $180,000',
      description: 'Lead risk assessment and management activities for our trading operations. Experience with market risk and credit risk analysis required.',
      sourceUrl: 'https://globalfinance.com/careers',
      timeZone: 'EST',
      additionalNotes: 'FRM certification preferred. Weekend availability required.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM002',
      status: 'ON_HOLD'
    },

    // HealthTech Innovations Job Postings
    {
      companyId: companies[2].id,
      companyName: 'HealthTech Innovations',
      title: 'Frontend Developer',
      location: 'Boston, MA',
      jobLink: 'https://healthtech.com/careers/frontend-dev',
      category: 'Software Development',
      experienceRange: '2-4 years',
      salaryRange: '$90,000 - $120,000',
      description: 'Join our team to build user-friendly healthcare applications. Experience with React, TypeScript, and healthcare domain knowledge preferred.',
      sourceUrl: 'https://healthtech.com/careers',
      timeZone: 'EST',
      additionalNotes: 'Remote work available. Startup environment with growth opportunities.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM003',
      status: 'ACTIVE'
    },
    {
      companyId: companies[2].id,
      companyName: 'HealthTech Innovations',
      title: 'Product Manager',
      location: 'Boston, MA',
      jobLink: 'https://healthtech.com/careers/product-manager',
      category: 'Product Management',
      experienceRange: '3-6 years',
      salaryRange: '$110,000 - $150,000',
      description: 'Lead product development for our telemedicine platform. Experience with healthcare products and agile methodologies required.',
      sourceUrl: 'https://healthtech.com/careers',
      timeZone: 'EST',
      additionalNotes: 'PMP certification preferred. Cross-functional team leadership required.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM003',
      status: 'DRAFT'
    },

    // EcoGreen Energy Job Postings
    {
      companyId: companies[3].id,
      companyName: 'EcoGreen Energy',
      title: 'Solar Engineer',
      location: 'Austin, TX',
      jobLink: 'https://ecogreen.com/careers/solar-engineer',
      category: 'Engineering',
      experienceRange: '3-5 years',
      salaryRange: '$85,000 - $115,000',
      description: 'Design and implement solar energy systems. Experience with PV system design and renewable energy technologies required.',
      sourceUrl: 'https://ecogreen.com/careers',
      timeZone: 'CST',
      additionalNotes: 'PE license preferred. Field work required.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM004',
      status: 'ACTIVE'
    },

    // RetailMax Corporation Job Postings
    {
      companyId: companies[4].id,
      companyName: 'RetailMax Corporation',
      title: 'E-commerce Manager',
      location: 'Chicago, IL',
      jobLink: 'https://retailmax.com/careers/ecommerce-manager',
      category: 'E-commerce',
      experienceRange: '4-7 years',
      salaryRange: '$95,000 - $130,000',
      description: 'Manage our online retail platform and drive e-commerce growth. Experience with Shopify, Magento, or similar platforms required.',
      sourceUrl: 'https://retailmax.com/careers',
      timeZone: 'CST',
      additionalNotes: 'Analytics experience preferred. Performance bonus available.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM005',
      status: 'ACTIVE'
    },
    {
      companyId: companies[4].id,
      companyName: 'RetailMax Corporation',
      title: 'Data Scientist',
      location: 'Chicago, IL',
      jobLink: 'https://retailmax.com/careers/data-scientist',
      category: 'Data Science',
      experienceRange: '3-6 years',
      salaryRange: '$100,000 - $140,000',
      description: 'Analyze customer data to drive business insights and improve retail operations. Experience with Python, R, and machine learning required.',
      sourceUrl: 'https://retailmax.com/careers',
      timeZone: 'CST',
      additionalNotes: 'PhD in Statistics or related field preferred. Big data experience required.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM005',
      status: 'CLOSED'
    },

    // StartupHub Ventures Job Postings
    {
      companyId: companies[5].id,
      companyName: 'StartupHub Ventures',
      title: 'Investment Analyst',
      location: 'Seattle, WA',
      jobLink: 'https://startuphub.com/careers/investment-analyst',
      category: 'Investment',
      experienceRange: '1-3 years',
      salaryRange: '$70,000 - $95,000',
      description: 'Support our investment team in evaluating startup opportunities. Strong analytical skills and passion for entrepreneurship required.',
      sourceUrl: 'https://startuphub.com/careers',
      timeZone: 'PST',
      additionalNotes: 'MBA preferred. Fast-paced startup environment.',
      createdBy: 'admin@trivens.com',
      bdmAssigned: 'BDM006',
      status: 'ACTIVE'
    }
  ];

  const createdJobPostings = [];
  for (const jobData of jobPostings) {
    const jobPosting = await prisma.jobPosting.create({
      data: jobData
    });
    createdJobPostings.push(jobPosting);
    console.log(`✅ Created job posting: ${jobPosting.title} at ${jobPosting.companyName}`);
  }

  console.log(`🎉 Successfully seeded ${createdJobPostings.length} job postings`);
  return createdJobPostings;
}

module.exports = { seedJobPostings };
