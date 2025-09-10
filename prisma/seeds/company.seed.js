// prisma/seeds/company.seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCompanies() {
  console.log('🏢 Seeding companies...');

  // Clear existing companies
  await prisma.company.deleteMany();

  const companies = [
    {
      name: 'TechCorp Solutions',
      website: 'https://techcorp.com',
      industry: 'Technology',
      location: 'San Francisco, CA',
      size: '51-200',
      description: 'Leading technology solutions provider specializing in cloud computing and AI.',
      agreementStatus: 'Signed',
      fee: 15000.00,
      paymentTerms: 'Net 30 days',
      warranty: '1 year comprehensive support'
    },
    {
      name: 'Global Finance Inc',
      website: 'https://globalfinance.com',
      industry: 'Financial Services',
      location: 'New York, NY',
      size: '501-1000',
      description: 'International financial services company with focus on investment banking.',
      agreementStatus: 'Pending',
      fee: 25000.00,
      paymentTerms: 'Net 45 days',
      warranty: '6 months support'
    },
    {
      name: 'HealthTech Innovations',
      website: 'https://healthtech.com',
      industry: 'Healthcare',
      location: 'Boston, MA',
      size: '11-50',
      description: 'Innovative healthcare technology startup developing telemedicine solutions.',
      agreementStatus: 'Signed',
      fee: 12000.00,
      paymentTerms: 'Net 30 days',
      warranty: '2 years support'
    },
    {
      name: 'EcoGreen Energy',
      website: 'https://ecogreen.com',
      industry: 'Energy',
      location: 'Austin, TX',
      size: '201-500',
      description: 'Renewable energy company focused on solar and wind power solutions.',
      agreementStatus: 'Under Review',
      fee: 18000.00,
      paymentTerms: 'Net 30 days',
      warranty: '1 year support'
    },
    {
      name: 'RetailMax Corporation',
      website: 'https://retailmax.com',
      industry: 'Retail',
      location: 'Chicago, IL',
      size: '1001-5000',
      description: 'Large retail chain with focus on e-commerce and omnichannel experiences.',
      agreementStatus: 'Signed',
      fee: 30000.00,
      paymentTerms: 'Net 60 days',
      warranty: '18 months support'
    },
    {
      name: 'StartupHub Ventures',
      website: 'https://startuphub.com',
      industry: 'Technology',
      location: 'Seattle, WA',
      size: '1-10',
      description: 'Early-stage startup accelerator and venture capital firm.',
      agreementStatus: 'Rejected',
      fee: 8000.00,
      paymentTerms: 'Net 15 days',
      warranty: '6 months support'
    }
  ];

  const createdCompanies = [];
  for (const companyData of companies) {
    const company = await prisma.company.create({
      data: companyData
    });
    createdCompanies.push(company);
    console.log(`✅ Created company: ${company.name}`);
  }

  console.log(`🎉 Successfully seeded ${createdCompanies.length} companies`);
  return createdCompanies;
}

module.exports = { seedCompanies };
