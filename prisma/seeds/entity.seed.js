const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const entities = [
  // Branches
  {
    name: 'New York Branch',
    code: 'NYC',
    type: 'branch',
    description: 'Main branch in New York City',
    location: 'New York, NY',
    isActive: true
  },
  {
    name: 'Los Angeles Branch',
    code: 'LA',
    type: 'branch',
    description: 'West Coast branch in Los Angeles',
    location: 'Los Angeles, CA',
    isActive: true
  },
  {
    name: 'Chicago Branch',
    code: 'CHI',
    type: 'branch',
    description: 'Midwest branch in Chicago',
    location: 'Chicago, IL',
    isActive: true
  },
  {
    name: 'Miami Branch',
    code: 'MIA',
    type: 'branch',
    description: 'Southeast branch in Miami',
    location: 'Miami, FL',
    isActive: true
  },
  {
    name: 'Seattle Branch',
    code: 'SEA',
    type: 'branch',
    description: 'Pacific Northwest branch in Seattle',
    location: 'Seattle, WA',
    isActive: true
  },

  // Departments
  {
    name: 'Enterprise Sales',
    code: 'ENT',
    type: 'department',
    description: 'Enterprise sales department',
    location: 'Remote',
    isActive: true
  },
  {
    name: 'SMB Sales',
    code: 'SMB',
    type: 'department',
    description: 'Small and medium business sales',
    location: 'Remote',
    isActive: true
  },
  {
    name: 'Technical Recruiting',
    code: 'TECH',
    type: 'department',
    description: 'Technical recruitment team',
    location: 'Remote',
    isActive: true
  },
  {
    name: 'Executive Search',
    code: 'EXEC',
    type: 'department',
    description: 'Executive and C-level recruitment',
    location: 'Remote',
    isActive: true
  },

  // Teams
  {
    name: 'AI/ML Team',
    code: 'AI',
    type: 'team',
    description: 'Specialized AI and Machine Learning recruitment team',
    location: 'Remote',
    isActive: true
  },
  {
    name: 'FinTech Team',
    code: 'FIN',
    type: 'team',
    description: 'Financial technology recruitment specialists',
    location: 'Remote',
    isActive: true
  },
  {
    name: 'Healthcare Team',
    code: 'HLTH',
    type: 'team',
    description: 'Healthcare and medical technology recruitment',
    location: 'Remote',
    isActive: true
  },
  {
    name: 'Startup Team',
    code: 'START',
    type: 'team',
    description: 'Startup and early-stage company recruitment',
    location: 'Remote',
    isActive: true
  }
];

async function seedEntities() {
  try {
    console.log('🌱 Seeding entities...');
    
    for (const entity of entities) {
      await prisma.entity.upsert({
        where: { code: entity.code },
        update: entity,
        create: entity
      });
    }
    
    console.log(`✅ Seeded ${entities.length} entities`);
  } catch (error) {
    console.error('❌ Error seeding entities:', error);
    throw error;
  }
}

module.exports = { seedEntities };
