const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const jobStatuses = [
  {
    name: 'Open',
    slug: 'open',
    isActive: true
  },
  {
    name: 'In Progress',
    slug: 'in-progress',
    isActive: true
  },
  {
    name: 'On Hold',
    slug: 'on-hold',
    isActive: true
  },
  {
    name: 'Closed',
    slug: 'closed',
    isActive: true
  },
  {
    name: 'Cancelled',
    slug: 'cancelled',
    isActive: true
  },
  {
    name: 'Filled',
    slug: 'filled',
    isActive: true
  },
  {
    name: 'Draft',
    slug: 'draft',
    isActive: true
  },
  {
    name: 'Archived',
    slug: 'archived',
    isActive: false
  }
];

async function seedJobStatuses() {
  console.log('🌱 Seeding job statuses...');
  
  try {
    for (const status of jobStatuses) {
      await prisma.jobStatus.upsert({
        where: { slug: status.slug },
        update: status,
        create: status
      });
    }
    
    console.log(`✅ Seeded ${jobStatuses.length} job statuses`);
  } catch (error) {
    console.error('❌ Error seeding job statuses:', error);
    throw error;
  }
}

module.exports = { seedJobStatuses };
