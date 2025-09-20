const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const candidateStages = [
  // Recruiter Workflow Stages
  {
    name: 'New Application',
    slug: 'new-application',
    isActive: true
  },
  {
    name: 'Attempted to Contact',
    slug: 'attempted-to-contact',
    isActive: true
  },
  {
    name: 'Call Scheduled',
    slug: 'call-scheduled',
    isActive: true
  },
  {
    name: 'Candidate Declined',
    slug: 'candidate-declined',
    isActive: true
  },
  {
    name: 'Phone Screened',
    slug: 'phone-screened',
    isActive: true
  },
  {
    name: 'Submitted to BDM',
    slug: 'submitted-to-bdm',
    isActive: true
  },
  {
    name: 'Recruiter Rejected',
    slug: 'recruiter-rejected',
    isActive: true
  },
  
  // BDM Workflow Stages
  {
    name: 'BDM Rejected',
    slug: 'bdm-rejected',
    isActive: true
  },
  {
    name: 'Submitted to Client',
    slug: 'submitted-to-client',
    isActive: true
  },
  {
    name: 'Submission Held',
    slug: 'submission-held',
    isActive: true
  },
  {
    name: 'Awaiting Feedback on Submission',
    slug: 'awaiting-feedback-submission',
    isActive: true
  },
  {
    name: 'Interview Requested',
    slug: 'interview-requested',
    isActive: true
  },
  {
    name: 'Interview Scheduled',
    slug: 'interview-scheduled',
    isActive: true
  },
  {
    name: 'Candidate Declined Interview',
    slug: 'candidate-declined-interview',
    isActive: true
  },
  {
    name: 'Awaiting Feedback on Interview',
    slug: 'awaiting-feedback-interview',
    isActive: true
  },
  {
    name: 'Candidate Rejected Before Interview',
    slug: 'candidate-rejected-before-interview',
    isActive: true
  },
  {
    name: 'Candidate Rejected After Interview',
    slug: 'candidate-rejected-after-interview',
    isActive: true
  },
  {
    name: 'Advanced to 2nd Round',
    slug: 'advanced-to-2nd-round',
    isActive: true
  },
  {
    name: 'Interview Rescheduled',
    slug: 'interview-rescheduled',
    isActive: true
  },
  {
    name: 'Interview No Show',
    slug: 'interview-no-show',
    isActive: true
  },
  {
    name: 'Advanced to Final Stage',
    slug: 'advanced-to-final-stage',
    isActive: true
  },
  {
    name: 'Verbal Offer',
    slug: 'verbal-offer',
    isActive: true
  },
  {
    name: 'Client Offered',
    slug: 'client-offered',
    isActive: true
  },
  {
    name: 'Candidate Accepted Offer',
    slug: 'candidate-accepted-offer',
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
