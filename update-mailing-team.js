const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateMailingTeam() {
  try {
    console.log('🔄 Updating mailing team for existing job postings...');
    
    // Update all existing job postings to have mailingTeam = 'triven'
    const result = await prisma.jobPosting.updateMany({
      where: {
        mailingTeam: null // Only update records where mailingTeam is null
      },
      data: {
        mailingTeam: 'triven'
      }
    });
    
    console.log(`✅ Updated ${result.count} job postings with mailing team 'triven'`);
    
    // Verify the update
    const totalJobPostings = await prisma.jobPosting.count();
    const jobPostingsWithMailingTeam = await prisma.jobPosting.count({
      where: {
        mailingTeam: 'triven'
      }
    });
    
    console.log(`📊 Total job postings: ${totalJobPostings}`);
    console.log(`📊 Job postings with mailing team 'triven': ${jobPostingsWithMailingTeam}`);
    
  } catch (error) {
    console.error('❌ Error updating mailing team:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateMailingTeam()
    .then(() => {
      console.log('🎉 Mailing team update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Mailing team update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateMailingTeam };
