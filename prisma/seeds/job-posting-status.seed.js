// prisma/seeds/job-posting-status.seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jobPostingStatuses = [
  { name: 'New', isActive: true, allowedFor: ['RA'] }, // RA context only
  { name: 'uncontacted', isActive: true, allowedFor: ['validation'] }, // Validation context only
  { name: 'contacted', isActive: true, allowedFor: ['validation'] }, // Validation context only
  { name: 'follow-up 1', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'follow-up 2', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'Follow-up Completed', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'Connected', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'Future', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'Negative', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'DNC', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'Qualified', isActive: true, allowedFor: ['validation', 'followup'] }, // Both validation and followup
  { name: 'Closed won', isActive: true, allowedFor: [] }, // Not available in any context
  { name: 'Closed lost', isActive: true, allowedFor: [] } // Not available in any context
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
