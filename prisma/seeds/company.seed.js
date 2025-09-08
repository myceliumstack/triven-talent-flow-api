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
      size: 'FIFTY_ONE_TO_TWO_HUNDRED',
      description: 'Leading technology solutions provider specializing in cloud computing and AI.',
      agreementStatus: 'SIGNED',
      fee: 15000.00,
      paymentTerms: 'Net 30 days',
      warranty: '1 year comprehensive support'
    },
    {
      name: 'Global Finance Inc',
      website: 'https://globalfinance.com',
      industry: 'Financial Services',
      location: 'New York, NY',
      size: 'FIVE_HUNDRED_ONE_TO_THOUSAND',
      description: 'International financial services company with focus on investment banking.',
      agreementStatus: 'PENDING',
      fee: 25000.00,
      paymentTerms: 'Net 45 days',
      warranty: '6 months support'
    },
    {
      name: 'HealthTech Innovations',
      website: 'https://healthtech.com',
      industry: 'Healthcare',
      location: 'Boston, MA',
      size: 'ELEVEN_TO_FIFTY',
      description: 'Innovative healthcare technology startup developing telemedicine solutions.',
      agreementStatus: 'SIGNED',
      fee: 12000.00,
      paymentTerms: 'Net 30 days',
      warranty: '2 years support'
    },
    {
      name: 'EcoGreen Energy',
      website: 'https://ecogreen.com',
      industry: 'Energy',
      location: 'Austin, TX',
      size: 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
      description: 'Renewable energy company focused on solar and wind power solutions.',
      agreementStatus: 'UNDER_REVIEW',
      fee: 18000.00,
      paymentTerms: 'Net 30 days',
      warranty: '1 year support'
    },
    {
      name: 'RetailMax Corporation',
      website: 'https://retailmax.com',
      industry: 'Retail',
      location: 'Chicago, IL',
      size: 'THOUSAND_ONE_TO_FIVE_THOUSAND',
      description: 'Large retail chain with focus on e-commerce and omnichannel experiences.',
      agreementStatus: 'SIGNED',
      fee: 30000.00,
      paymentTerms: 'Net 60 days',
      warranty: '18 months support'
    },
    {
      name: 'StartupHub Ventures',
      website: 'https://startuphub.com',
      industry: 'Technology',
      location: 'Seattle, WA',
      size: 'ONE_TO_TEN',
      description: 'Early-stage startup accelerator and venture capital firm.',
      agreementStatus: 'REJECTED',
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
