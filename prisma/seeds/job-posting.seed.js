const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const jobPostings = [
  // Tech Jobs
  {
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    jobLink: 'https://techcorp.com/careers/senior-software-engineer',
    category: 'Engineering',
    experienceRange: '5-8 years',
    salaryRange: '$120,000 - $160,000',
    description: 'We are looking for a Senior Software Engineer to join our engineering team. You will be responsible for designing, developing, and maintaining our core platform.',
    sourceUrl: 'https://techcorp.com/careers',
    timeZone: 'PST',
    additionalNotes: 'Remote work available. Must have experience with React and Node.js.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'john.smith@trivens.com',
    validation: true
  },
  {
    title: 'Data Scientist',
    location: 'Austin, TX',
    jobLink: 'https://dataflow.com/careers/data-scientist',
    category: 'Data Science',
    experienceRange: '3-6 years',
    salaryRange: '$100,000 - $140,000',
    description: 'Join our data science team to build machine learning models and analytics solutions.',
    sourceUrl: 'https://dataflow.com/careers',
    timeZone: 'CST',
    additionalNotes: 'Experience with Python, TensorFlow, and SQL required.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'sarah.johnson@trivens.com',
    validation: true
  },
  {
    title: 'Cloud Architect',
    location: 'Seattle, WA',
    jobLink: 'https://cloudtech.com/careers/cloud-architect',
    category: 'Cloud Engineering',
    experienceRange: '6-10 years',
    salaryRange: '$140,000 - $180,000',
    description: 'Design and implement cloud infrastructure solutions using AWS, Azure, and GCP.',
    sourceUrl: 'https://cloudtech.com/careers',
    timeZone: 'PST',
    additionalNotes: 'AWS certification preferred. Remote work available.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'mike.davis@trivens.com',
    validation: false
  },
  {
    title: 'AI/ML Engineer',
    location: 'Boston, MA',
    jobLink: 'https://aiinnovations.com/careers/ai-ml-engineer',
    category: 'Artificial Intelligence',
    experienceRange: '4-7 years',
    salaryRange: '$130,000 - $170,000',
    description: 'Develop and deploy machine learning models for various business applications.',
    sourceUrl: 'https://aiinnovations.com/careers',
    timeZone: 'EST',
    additionalNotes: 'PhD in Computer Science or related field preferred.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'lisa.wilson@trivens.com',
    validation: true
  },
  {
    title: 'Full Stack Developer',
    location: 'New York, NY',
    jobLink: 'https://fintechsolutions.com/careers/full-stack-developer',
    category: 'Engineering',
    experienceRange: '3-5 years',
    salaryRange: '$90,000 - $130,000',
    description: 'Build and maintain web applications using modern technologies.',
    sourceUrl: 'https://fintechsolutions.com/careers',
    timeZone: 'EST',
    additionalNotes: 'Experience with React, Node.js, and PostgreSQL required.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'david.brown@trivens.com',
    validation: true
  },

  // Healthcare Jobs
  {
    title: 'Healthcare Data Analyst',
    location: 'Chicago, IL',
    jobLink: 'https://medtech.com/careers/healthcare-data-analyst',
    category: 'Healthcare',
    experienceRange: '2-5 years',
    salaryRange: '$70,000 - $100,000',
    description: 'Analyze healthcare data to improve patient outcomes and operational efficiency.',
    sourceUrl: 'https://medtech.com/careers',
    timeZone: 'CST',
    additionalNotes: 'Experience with healthcare data and HIPAA compliance required.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'emma.taylor@trivens.com',
    validation: true
  },
  {
    title: 'Medical Software Developer',
    location: 'Miami, FL',
    jobLink: 'https://healthdata.com/careers/medical-software-developer',
    category: 'Healthcare Technology',
    experienceRange: '3-6 years',
    salaryRange: '$80,000 - $120,000',
    description: 'Develop software solutions for healthcare providers and patients.',
    sourceUrl: 'https://healthdata.com/careers',
    timeZone: 'EST',
    additionalNotes: 'Experience with healthcare regulations and medical software development.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'alex.garcia@trivens.com',
    validation: false
  },

  // E-commerce Jobs
  {
    title: 'E-commerce Manager',
    location: 'Los Angeles, CA',
    jobLink: 'https://shopeasy.com/careers/ecommerce-manager',
    category: 'E-commerce',
    experienceRange: '4-7 years',
    salaryRange: '$75,000 - $110,000',
    description: 'Manage and optimize e-commerce platforms and online sales strategies.',
    sourceUrl: 'https://shopeasy.com/careers',
    timeZone: 'PST',
    additionalNotes: 'Experience with Shopify, WooCommerce, and digital marketing.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'maria.rodriguez@trivens.com',
    validation: true
  },
  {
    title: 'Retail Technology Specialist',
    location: 'Denver, CO',
    jobLink: 'https://retailtech.com/careers/retail-technology-specialist',
    category: 'Retail Technology',
    experienceRange: '3-6 years',
    salaryRange: '$65,000 - $95,000',
    description: 'Implement and support retail technology solutions for brick-and-mortar stores.',
    sourceUrl: 'https://retailtech.com/careers',
    timeZone: 'MST',
    additionalNotes: 'Experience with POS systems and retail operations.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'james.lee@trivens.com',
    validation: true
  },

  // Manufacturing Jobs
  {
    title: 'Manufacturing Engineer',
    location: 'Detroit, MI',
    jobLink: 'https://autoparts.com/careers/manufacturing-engineer',
    category: 'Manufacturing',
    experienceRange: '5-8 years',
    salaryRange: '$85,000 - $120,000',
    description: 'Optimize manufacturing processes and implement automation solutions.',
    sourceUrl: 'https://autoparts.com/careers',
    timeZone: 'EST',
    additionalNotes: 'Experience with automotive manufacturing and lean principles.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'jennifer.white@trivens.com',
    validation: true
  },
  {
    title: 'Renewable Energy Engineer',
    location: 'Portland, OR',
    jobLink: 'https://greenenergy.com/careers/renewable-energy-engineer',
    category: 'Renewable Energy',
    experienceRange: '4-7 years',
    salaryRange: '$90,000 - $130,000',
    description: 'Design and implement renewable energy systems and solutions.',
    sourceUrl: 'https://greenenergy.com/careers',
    timeZone: 'PST',
    additionalNotes: 'Experience with solar, wind, or other renewable energy technologies.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'robert.miller@trivens.com',
    validation: false
  },

  // Consulting Jobs
  {
    title: 'Management Consultant',
    location: 'Washington, DC',
    jobLink: 'https://consultpro.com/careers/management-consultant',
    category: 'Consulting',
    experienceRange: '3-6 years',
    salaryRange: '$80,000 - $120,000',
    description: 'Provide strategic consulting services to clients across various industries.',
    sourceUrl: 'https://consultpro.com/careers',
    timeZone: 'EST',
    additionalNotes: 'MBA preferred. Experience with business strategy and operations.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'patricia.moore@trivens.com',
    validation: true
  },
  {
    title: 'Strategy Analyst',
    location: 'Atlanta, GA',
    jobLink: 'https://strategypartners.com/careers/strategy-analyst',
    category: 'Strategy',
    experienceRange: '2-4 years',
    salaryRange: '$60,000 - $90,000',
    description: 'Analyze business strategies and provide recommendations for improvement.',
    sourceUrl: 'https://strategypartners.com/careers',
    timeZone: 'EST',
    additionalNotes: 'Strong analytical skills. Experience with data analysis and reporting.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'william.anderson@trivens.com',
    validation: true
  },

  // Startup Jobs
  {
    title: 'Startup CTO',
    location: 'Austin, TX',
    jobLink: 'https://startupx.com/careers/cto',
    category: 'Technology Leadership',
    experienceRange: '8-12 years',
    salaryRange: '$150,000 - $200,000',
    description: 'Lead technical strategy and development for an early-stage startup.',
    sourceUrl: 'https://startupx.com/careers',
    timeZone: 'CST',
    additionalNotes: 'Equity participation available. Experience with scaling technology teams.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'elizabeth.thomas@trivens.com',
    validation: false
  },
  {
    title: 'R&D Engineer',
    location: 'San Diego, CA',
    jobLink: 'https://innovatelab.com/careers/rd-engineer',
    category: 'Research & Development',
    experienceRange: '3-6 years',
    salaryRange: '$70,000 - $100,000',
    description: 'Conduct research and development for innovative technology solutions.',
    sourceUrl: 'https://innovatelab.com/careers',
    timeZone: 'PST',
    additionalNotes: 'PhD in Engineering or related field preferred.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'michael.jackson@trivens.com',
    validation: true
  },

  // Enterprise Jobs
  {
    title: 'Enterprise Solutions Architect',
    location: 'New York, NY',
    jobLink: 'https://globalenterprises.com/careers/enterprise-solutions-architect',
    category: 'Enterprise Architecture',
    experienceRange: '8-12 years',
    salaryRange: '$160,000 - $220,000',
    description: 'Design and implement enterprise-scale software solutions.',
    sourceUrl: 'https://globalenterprises.com/careers',
    timeZone: 'EST',
    additionalNotes: 'Experience with enterprise software and large-scale systems.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'jessica.martin@trivens.com',
    validation: true
  },
  {
    title: 'Industrial Systems Engineer',
    location: 'Houston, TX',
    jobLink: 'https://megacorp.com/careers/industrial-systems-engineer',
    category: 'Industrial Engineering',
    experienceRange: '6-10 years',
    salaryRange: '$100,000 - $140,000',
    description: 'Design and optimize industrial systems and manufacturing processes.',
    sourceUrl: 'https://megacorp.com/careers',
    timeZone: 'CST',
    additionalNotes: 'Experience with industrial automation and control systems.',
    createdBy: 'admin@trivens.com',
    bdmAssigned: 'christopher.thompson@trivens.com',
    validation: true
  }
];

async function seedJobPostings() {
  try {
    console.log('🌱 Seeding job postings...');
    
    // Get companies and users
    const companies = await prisma.company.findMany();
    const users = await prisma.user.findMany();
    const jobPostingStatuses = await prisma.jobPostingStatus.findMany();
    
    if (companies.length === 0) {
      throw new Error('No companies found. Please seed companies first.');
    }
    if (users.length === 0) {
      throw new Error('No users found. Please seed users first.');
    }
    if (jobPostingStatuses.length === 0) {
      throw new Error('No job posting statuses found. Please seed job posting statuses first.');
    }
    
    for (let i = 0; i < jobPostings.length; i++) {
      const posting = jobPostings[i];
      const company = companies[i % companies.length];
      const createdByUser = users.find(u => u.email === posting.createdBy) || users[0];
      const bdmUser = users.find(u => u.email === posting.bdmAssigned) || users[1];
      const status = jobPostingStatuses[Math.floor(Math.random() * jobPostingStatuses.length)];
      
      // Check if job posting already exists
      const existingPosting = await prisma.jobPosting.findFirst({
        where: { 
          title: posting.title,
          companyId: company.id
        }
      });
      
      if (!existingPosting) {
        await prisma.jobPosting.create({
          data: {
            ...posting,
            companyId: company.id,
            createdById: createdByUser.id,
            statusId: status.id,
            mailingTeam: 'triven'
          }
        });
      }
    }
    
    console.log(`✅ Seeded ${jobPostings.length} job postings`);
  } catch (error) {
    console.error('❌ Error seeding job postings:', error);
    throw error;
  }
}

module.exports = { seedJobPostings };