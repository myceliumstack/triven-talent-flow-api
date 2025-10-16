const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCompanies() {
  console.log('🌱 Seeding companies...');

  // Clear existing companies
  await prisma.company.deleteMany();

  const companyData = [
    // Tech Companies
    {
      name: 'TechCorp Solutions',
      website: 'https://techcorp.com',
      industry: 'Technology',
      location: 'San Francisco, CA',
      size: '1000-5000',
      description: 'Leading technology solutions provider',
      agreementStatus: 'signed',
      fee: 15000.00,
      paymentTerms: 'Net 30',
      warranty: '90 days'
    },
  {
    name: 'DataFlow Inc',
    website: 'https://dataflow.com',
    industry: 'Data Analytics',
    location: 'Austin, TX',
    size: '500-1000',
    description: 'Data analytics and business intelligence company',
    agreementStatus: 'signed',
    fee: 12000.00,
    paymentTerms: 'Net 15',
    warranty: '60 days'
  },
  {
    name: 'CloudTech Systems',
    website: 'https://cloudtech.com',
    industry: 'Cloud Computing',
    location: 'Seattle, WA',
    size: '1000-5000',
    description: 'Cloud infrastructure and services provider',
    agreementStatus: 'pending',
    fee: 18000.00,
    paymentTerms: 'Net 30',
    warranty: '120 days'
  },
  {
    name: 'AI Innovations',
    website: 'https://aiinnovations.com',
    industry: 'Artificial Intelligence',
    location: 'Boston, MA',
    size: '100-500',
    description: 'AI and machine learning solutions',
    agreementStatus: 'signed',
    fee: 20000.00,
    paymentTerms: 'Net 30',
    warranty: '90 days'
  },
  {
    name: 'FinTech Solutions',
    website: 'https://fintechsolutions.com',
    industry: 'Financial Technology',
    location: 'New York, NY',
    size: '500-1000',
    description: 'Financial technology and payment solutions',
    agreementStatus: 'signed',
    fee: 16000.00,
    paymentTerms: 'Net 15',
    warranty: '60 days'
  },

  // Healthcare Companies
  {
    name: 'MedTech Corp',
    website: 'https://medtech.com',
    industry: 'Healthcare Technology',
    location: 'Chicago, IL',
    size: '1000-5000',
    description: 'Medical technology and healthcare solutions',
    agreementStatus: 'signed',
    fee: 14000.00,
    paymentTerms: 'Net 30',
    warranty: '90 days'
  },
  {
    name: 'HealthData Systems',
    website: 'https://healthdata.com',
    industry: 'Healthcare',
    location: 'Miami, FL',
    size: '500-1000',
    description: 'Healthcare data management systems',
    agreementStatus: 'pending',
    fee: 13000.00,
    paymentTerms: 'Net 30',
    warranty: '60 days'
  },

  // E-commerce Companies
  {
    name: 'ShopEasy Commerce',
    website: 'https://shopeasy.com',
    industry: 'E-commerce',
    location: 'Los Angeles, CA',
    size: '1000-5000',
    description: 'E-commerce platform and marketplace',
    agreementStatus: 'signed',
    fee: 11000.00,
    paymentTerms: 'Net 30',
    warranty: '90 days'
  },
  {
    name: 'RetailTech Solutions',
    website: 'https://retailtech.com',
    industry: 'Retail Technology',
    location: 'Denver, CO',
    size: '500-1000',
    description: 'Retail technology and point-of-sale solutions',
    agreementStatus: 'signed',
    fee: 10000.00,
    paymentTerms: 'Net 15',
    warranty: '60 days'
  },

  // Manufacturing Companies
  {
    name: 'AutoParts Manufacturing',
    website: 'https://autoparts.com',
    industry: 'Manufacturing',
    location: 'Detroit, MI',
    size: '5000+',
    description: 'Automotive parts manufacturing',
    agreementStatus: 'signed',
    fee: 25000.00,
    paymentTerms: 'Net 30',
    warranty: '120 days'
  },
  {
    name: 'GreenEnergy Corp',
    website: 'https://greenenergy.com',
    industry: 'Renewable Energy',
    location: 'Portland, OR',
    size: '1000-5000',
    description: 'Renewable energy solutions and solar technology',
    agreementStatus: 'pending',
    fee: 17000.00,
    paymentTerms: 'Net 30',
    warranty: '90 days'
  },

  // Consulting Companies
  {
    name: 'ConsultPro Services',
    website: 'https://consultpro.com',
    industry: 'Management Consulting',
    location: 'Washington, DC',
    size: '500-1000',
    description: 'Management consulting and business advisory services',
    agreementStatus: 'signed',
    fee: 15000.00,
    paymentTerms: 'Net 30',
    warranty: '60 days'
  },
  {
    name: 'Strategy Partners',
    website: 'https://strategypartners.com',
    industry: 'Strategy Consulting',
    location: 'Atlanta, GA',
    size: '100-500',
    description: 'Strategic planning and business transformation',
    agreementStatus: 'signed',
    fee: 12000.00,
    paymentTerms: 'Net 15',
    warranty: '90 days'
  },

  // Startups
  {
    name: 'StartupX',
    website: 'https://startupx.com',
    industry: 'Technology',
    location: 'Austin, TX',
    size: '10-50',
    description: 'Early-stage technology startup',
    agreementStatus: 'pending',
    fee: 5000.00,
    paymentTerms: 'Net 15',
    warranty: '30 days'
  },
  {
    name: 'InnovateLab',
    website: 'https://innovatelab.com',
    industry: 'Research & Development',
    location: 'San Diego, CA',
    size: '50-100',
    description: 'R&D and innovation lab',
    agreementStatus: 'signed',
    fee: 8000.00,
    paymentTerms: 'Net 15',
    warranty: '45 days'
  },

  // Enterprise Companies
  {
    name: 'Global Enterprises',
    website: 'https://globalenterprises.com',
    industry: 'Enterprise Software',
    location: 'New York, NY',
    size: '5000+',
    description: 'Global enterprise software solutions',
    agreementStatus: 'signed',
    fee: 30000.00,
    paymentTerms: 'Net 30',
    warranty: '180 days'
  },
  {
    name: 'MegaCorp Industries',
    website: 'https://megacorp.com',
    industry: 'Manufacturing',
    location: 'Houston, TX',
    size: '5000+',
    description: 'Large-scale manufacturing and industrial solutions',
    agreementStatus: 'signed',
    fee: 35000.00,
    paymentTerms: 'Net 30',
    warranty: '120 days'
  }
];

  try {
    // Get the first user as createdBy
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      throw new Error('No users found. Please seed users first.');
    }
    
    const createdCompanies = [];
    for (const company of companyData) {
      // Check if company already exists
      const existingCompany = await prisma.company.findFirst({
        where: { name: company.name }
      });
      
      if (!existingCompany) {
        const createdCompany = await prisma.company.create({
          data: {
            ...company,
            createdById: firstUser.id
          }
        });
        createdCompanies.push(createdCompany);
      } else {
        createdCompanies.push(existingCompany);
      }
    }
    
    console.log(`✅ Seeded ${createdCompanies.length} companies`);
    return createdCompanies;
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    throw error;
  }
}

module.exports = { seedCompanies };