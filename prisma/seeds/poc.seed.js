// prisma/seeds/poc.seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPOCs(companies) {
  console.log('👥 Seeding POCs...');

  // Clear existing POCs
  await prisma.pOC.deleteMany();

  // If no companies provided, get them from database
  if (!companies || companies.length === 0) {
    companies = await prisma.company.findMany();
    console.log(`Found ${companies.length} companies in database`);
  }

  const pocs = [
    // TechCorp Solutions POCs
    {
      companyId: companies[0].id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@techcorp.com',
      designation: 'HR Director',
      location: 'San Francisco, CA',
      phone: '+1-555-0101',
      mobile: '+1-555-1101',
      department: 'Human Resources'
    },
    {
      companyId: companies[0].id,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@techcorp.com',
      designation: 'Engineering Manager',
      location: 'San Francisco, CA',
      phone: '+1-555-0102',
      mobile: '+1-555-1102',
      department: 'Engineering'
    },
    
    // Global Finance Inc POCs
    {
      companyId: companies[1].id,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@globalfinance.com',
      designation: 'Talent Acquisition Manager',
      location: 'New York, NY',
      phone: '+1-555-0201',
      mobile: '+1-555-1201',
      department: 'Human Resources'
    },
    {
      companyId: companies[1].id,
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@globalfinance.com',
      designation: 'VP of Operations',
      location: 'New York, NY',
      phone: '+1-555-0202',
      mobile: '+1-555-1202',
      department: 'Operations'
    },

    // HealthTech Innovations POCs
    {
      companyId: companies[2].id,
      firstName: 'Lisa',
      lastName: 'Wang',
      email: 'lisa.wang@healthtech.com',
      designation: 'CEO',
      location: 'Boston, MA',
      phone: '+1-555-0301',
      mobile: '+1-555-1301',
      department: 'Executive'
    },
    {
      companyId: companies[2].id,
      firstName: 'James',
      lastName: 'Anderson',
      email: 'james.anderson@healthtech.com',
      designation: 'CTO',
      location: 'Boston, MA',
      phone: '+1-555-0302',
      mobile: '+1-555-1302',
      department: 'Technology'
    },

    // EcoGreen Energy POCs
    {
      companyId: companies[3].id,
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@ecogreen.com',
      designation: 'HR Manager',
      location: 'Austin, TX',
      phone: '+1-555-0401',
      mobile: '+1-555-1401',
      department: 'Human Resources'
    },
    {
      companyId: companies[3].id,
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@ecogreen.com',
      designation: 'Project Manager',
      location: 'Austin, TX',
      phone: '+1-555-0402',
      mobile: '+1-555-1402',
      department: 'Project Management'
    },

    // RetailMax Corporation POCs
    {
      companyId: companies[4].id,
      firstName: 'Jennifer',
      lastName: 'Davis',
      email: 'jennifer.davis@retailmax.com',
      designation: 'Senior HR Director',
      location: 'Chicago, IL',
      phone: '+1-555-0501',
      mobile: '+1-555-1501',
      department: 'Human Resources'
    },
    {
      companyId: companies[4].id,
      firstName: 'Christopher',
      lastName: 'Wilson',
      email: 'christopher.wilson@retailmax.com',
      designation: 'IT Director',
      location: 'Chicago, IL',
      phone: '+1-555-0502',
      mobile: '+1-555-1502',
      department: 'Information Technology'
    },

    // StartupHub Ventures POCs
    {
      companyId: companies[5].id,
      firstName: 'Amanda',
      lastName: 'Taylor',
      email: 'amanda.taylor@startuphub.com',
      designation: 'Founder & CEO',
      location: 'Seattle, WA',
      phone: '+1-555-0601',
      mobile: '+1-555-1601',
      department: 'Executive'
    }
  ];

  const createdPOCs = [];
  for (const pocData of pocs) {
    const poc = await prisma.pOC.create({
      data: pocData
    });
    createdPOCs.push(poc);
    console.log(`✅ Created POC: ${poc.firstName} ${poc.lastName} (${poc.email})`);
  }

  console.log(`🎉 Successfully seeded ${createdPOCs.length} POCs`);
  return createdPOCs;
}

module.exports = { seedPOCs };
