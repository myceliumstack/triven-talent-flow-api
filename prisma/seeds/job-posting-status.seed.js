// prisma/seeds/job-posting-status.seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jobPostingStatuses = [
  { name: 'uncontacted', isActive: true },
  { name: 'contacted', isActive: true },
  { name: 'follow-up 1', isActive: true },
  { name: 'follow-up 2', isActive: true },
  { name: 'Follow-up Completed', isActive: true },
  { name: 'Connected', isActive: true },
  { name: 'Future', isActive: true },
  { name: 'Negative', isActive: true },
  { name: 'DNC', isActive: true },
  { name: 'Qualified', isActive: true },
  { name: 'Closed won', isActive: true },
  { name: 'Closed lost', isActive: true }
];

async function seedJobPostingStatuses() {
  console.log('🔄 Starting JobPostingStatus seed...');
  
  try {
    // Clear existing job posting statuses
    await prisma.jobPostingStatus.deleteMany({});
    console.log('🗑️ Cleared existing job posting statuses');

    // Create job posting statuses
    const createdStatuses = [];
    for (const statusData of jobPostingStatuses) {
      const status = await prisma.jobPostingStatus.create({
        data: statusData
      });
      createdStatuses.push(status);
      console.log(`✅ Created status: ${status.name} (ID: ${status.id})`);
    }

    console.log(`🎯 Successfully created ${createdStatuses.length} job posting statuses`);
    return createdStatuses;
  } catch (error) {
    console.error('❌ Error seeding job posting statuses:', error);
    throw error;
  }
}

// Export the seed function
module.exports = { seedJobPostingStatuses };

// Run directly if this file is executed
if (require.main === module) {
  seedJobPostingStatuses()
    .then(() => {
      console.log('🎉 JobPostingStatus seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 JobPostingStatus seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
