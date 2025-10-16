const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMailingTeamUpdate() {
  try {
    console.log('🚀 Starting MailingTeam field update process...');
    
    // Step 1: Check if the mailing_team column exists
    console.log('🔍 Checking database schema...');
    
    try {
      // Try to query the mailing_team column to see if it exists
      await prisma.$queryRaw`SELECT mailing_team FROM job_postings LIMIT 1`;
      console.log('✅ mailing_team column already exists in database');
    } catch (error) {
      if (error.code === 'P2022' || error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ mailing_team column does not exist. Please run the migration first:');
        console.log('   npx prisma migrate deploy');
        console.log('   or');
        console.log('   npx prisma db push');
        return;
      } else {
        throw error;
      }
    }
    
    // Step 2: Update existing job postings with mailing team
    console.log('📧 Updating existing job postings with mailing team...');
    
    const result = await prisma.jobPosting.updateMany({
      where: {
        mailingTeam: null
      },
      data: {
        mailingTeam: 'triven'
      }
    });
    
    console.log(`✅ Updated ${result.count} job postings with mailing team 'triven'`);
    
    // Step 3: Verify the update
    const totalJobPostings = await prisma.jobPosting.count();
    const jobPostingsWithMailingTeam = await prisma.jobPosting.count({
      where: {
        mailingTeam: 'triven'
      }
    });
    
    console.log('📊 Summary:');
    console.log(`   Total job postings: ${totalJobPostings}`);
    console.log(`   Job postings with mailing team 'triven': ${jobPostingsWithMailingTeam}`);
    
    if (totalJobPostings === jobPostingsWithMailingTeam) {
      console.log('🎉 All job postings now have mailing team set to "triven"!');
    } else {
      console.log('⚠️  Some job postings may not have been updated. Please check manually.');
    }
    
  } catch (error) {
    console.error('❌ Error applying mailing team update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  applyMailingTeamUpdate()
    .then(() => {
      console.log('🎉 Mailing team update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Mailing team update failed:', error);
      process.exit(1);
    });
}

module.exports = { applyMailingTeamUpdate };
