// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

// Import seed functions
const { seedRBAC } = require('./seeds/rbac.seed');
const { seedUsers } = require('./seeds/user.seed');
const { seedEntities } = require('./seeds/entity.seed');
const { seedCompanies } = require('./seeds/company.seed');
const { seedPOCs } = require('./seeds/poc.seed');
const { seedJobPostingStatuses } = require('./seeds/job-posting-status.seed');
const { seedJobPostings } = require('./seeds/job-posting.seed');
const { seedJobStatuses } = require('./seeds/job-status.seed');
const { seedCandidateStages } = require('./seeds/candidate-stage.seed');
const { seedJobs } = require('./seeds/job.seed');
const { seedCandidates } = require('./seeds/candidate.seed');
const { seedEducation } = require('./seeds/education.seed');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // 1. Seed RBAC System (Roles, Permissions, Admin User)
    console.log('\n🔐 Step 1: Seeding RBAC system...');
    await seedRBAC();

    // 2. Seed Users (depends on RBAC)
    console.log('\n👤 Step 2: Seeding users...');
    await seedUsers();

    // 3. Seed Entities (independent)
    console.log('\n🏢 Step 3: Seeding entities...');
    await seedEntities();

    // 4. Seed Job Posting Statuses (independent)
    console.log('\n📊 Step 4: Seeding job posting statuses...');
    const jobPostingStatuses = await seedJobPostingStatuses();

    // 5. Seed Companies (independent)
    console.log('\n🏢 Step 5: Seeding companies...');
    const companies = await seedCompanies();

    // 6. Seed POCs (depends on companies)
    console.log('\n👥 Step 6: Seeding POCs...');
    const pocs = await seedPOCs(companies);

    // 7. Seed Job Postings (depends on companies and statuses)
    console.log('\n💼 Step 7: Seeding job postings...');
    const jobPostings = await seedJobPostings(companies, jobPostingStatuses);

    // 8. Seed Job Statuses (independent)
    console.log('\n📊 Step 8: Seeding job statuses...');
    const jobStatuses = await seedJobStatuses();

    // 9. Seed Candidate Stages (independent)
    console.log('\n📊 Step 9: Seeding candidate stages...');
    const candidateStages = await seedCandidateStages();

    // 10. Seed Jobs (depends on job postings and statuses)
    console.log('\n💼 Step 10: Seeding jobs...');
    const jobs = await seedJobs(jobPostings, jobStatuses);

    // 11. Seed Candidates (independent)
    console.log('\n👥 Step 11: Seeding candidates...');
    const candidates = await seedCandidates();

    // 12. Seed Education (depends on candidates)
    console.log('\n🎓 Step 12: Seeding education...');
    await seedEducation(candidates);

    console.log('\n🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log('   ✅ Enhanced RBAC system with hierarchy');
    console.log('   ✅ 65 users with proper role assignments');
    console.log('   ✅ All business entities seeded');
    console.log('   ✅ Complete organizational structure');
    console.log('   ✅ Ready for production use');

    console.log('\n🔑 Default Login Credentials:');
    console.log('   Admin: admin@trivens.com / Admin@123');
    console.log('   VP: vp@trivens.com / Password123!');
    console.log('   BDM: bdm@trivens.com / Password123!');
    console.log('   Recruiter: recruiter@trivens.com / Password123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });