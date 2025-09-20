const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const candidateStages = [
  {
    name: 'Applied',
    slug: 'applied',
    isActive: true
  },
  {
    name: 'Screening',
    slug: 'screening',
    isActive: true
  },
  {
    name: 'Phone Interview',
    slug: 'phone-interview',
    isActive: true
  },
  {
    name: 'Technical Interview',
    slug: 'technical-interview',
    isActive: true
  },
  {
    name: 'HR Interview',
    slug: 'hr-interview',
    isActive: true
  },
  {
    name: 'Final Interview',
    slug: 'final-interview',
    isActive: true
  },
  {
    name: 'Reference Check',
    slug: 'reference-check',
    isActive: true
  },
  {
    name: 'Offer Extended',
    slug: 'offer-extended',
    isActive: true
  },
  {
    name: 'Offer Accepted',
    slug: 'offer-accepted',
    isActive: true
  },
  {
    name: 'Offer Declined',
    slug: 'offer-declined',
    isActive: true
  },
  {
    name: 'Rejected',
    slug: 'rejected',
    isActive: true
  },
  {
    name: 'Withdrawn',
    slug: 'withdrawn',
    isActive: true
  },
  {
    name: 'On Hold',
    slug: 'on-hold',
    isActive: true
  }
];

async function seedCandidateStages() {
  console.log('🌱 Seeding candidate stages...');
  
  try {
    for (const stage of candidateStages) {
      await prisma.candidateStage.upsert({
        where: { slug: stage.slug },
        update: stage,
        create: stage
      });
    }
    
    console.log(`✅ Seeded ${candidateStages.length} candidate stages`);
  } catch (error) {
    console.error('❌ Error seeding candidate stages:', error);
    throw error;
  }
}

module.exports = { seedCandidateStages };
