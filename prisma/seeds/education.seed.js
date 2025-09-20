const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedEducation() {
  console.log('🌱 Seeding education records...');
  
  try {
    // Get candidates to associate education with
    const candidates = await prisma.candidate.findMany({ take: 5 });

    if (candidates.length === 0) {
      console.log('⚠️  Skipping education seeding - no candidates found');
      return;
    }

    const educationRecords = [
      {
        candidateId: candidates[0].id,
        degree: 'Bachelor of Science',
        institution: 'Stanford University',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2019,
        gpa: 3.8,
        isCompleted: true,
        startYear: 2015,
        endYear: 2019,
        location: 'Stanford, CA',
        description: 'Graduated with honors. Focus on software engineering and algorithms.'
      },
      {
        candidateId: candidates[0].id,
        degree: 'Master of Science',
        institution: 'Carnegie Mellon University',
        fieldOfStudy: 'Software Engineering',
        graduationYear: 2021,
        gpa: 3.9,
        isCompleted: true,
        startYear: 2019,
        endYear: 2021,
        location: 'Pittsburgh, PA',
        description: 'Specialized in distributed systems and cloud computing.'
      },
      {
        candidateId: candidates[1].id,
        degree: 'Bachelor of Engineering',
        institution: 'University of Washington',
        fieldOfStudy: 'Computer Engineering',
        graduationYear: 2020,
        gpa: 3.7,
        isCompleted: true,
        startYear: 2016,
        endYear: 2020,
        location: 'Seattle, WA',
        description: 'Strong foundation in both hardware and software engineering.'
      },
      {
        candidateId: candidates[2].id,
        degree: 'Bachelor of Science',
        institution: 'New York University',
        fieldOfStudy: 'Information Systems',
        graduationYear: 2018,
        gpa: 3.6,
        isCompleted: true,
        startYear: 2014,
        endYear: 2018,
        location: 'New York, NY',
        description: 'Combined business and technology education with focus on enterprise systems.'
      },
      {
        candidateId: candidates[2].id,
        degree: 'Master of Business Administration',
        institution: 'Columbia Business School',
        fieldOfStudy: 'Technology Management',
        graduationYear: 2020,
        gpa: 3.8,
        isCompleted: true,
        startYear: 2018,
        endYear: 2020,
        location: 'New York, NY',
        description: 'Executive MBA with focus on technology leadership and digital transformation.'
      },
      {
        candidateId: candidates[3].id,
        degree: 'Bachelor of Fine Arts',
        institution: 'Art Center College of Design',
        fieldOfStudy: 'Graphic Design',
        graduationYear: 2021,
        gpa: 3.9,
        isCompleted: true,
        startYear: 2017,
        endYear: 2021,
        location: 'Pasadena, CA',
        description: 'Specialized in digital design and user experience. Portfolio includes award-winning web designs.'
      },
      {
        candidateId: candidates[4].id,
        degree: 'Bachelor of Science',
        institution: 'University of California, Berkeley',
        fieldOfStudy: 'Electrical Engineering and Computer Sciences',
        graduationYear: 2017,
        gpa: 3.5,
        isCompleted: true,
        startYear: 2013,
        endYear: 2017,
        location: 'Berkeley, CA',
        description: 'EECS program with focus on software engineering and system design.'
      },
      {
        candidateId: candidates[4].id,
        degree: 'Master of Science',
        institution: 'Massachusetts Institute of Technology',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2019,
        gpa: 3.7,
        isCompleted: true,
        startYear: 2017,
        endYear: 2019,
        location: 'Cambridge, MA',
        description: 'Research focus on distributed systems and machine learning applications.'
      }
    ];

    for (const education of educationRecords) {
      await prisma.education.create({
        data: education
      });
    }
    
    console.log(`✅ Seeded ${educationRecords.length} education records`);
  } catch (error) {
    console.error('❌ Error seeding education records:', error);
    throw error;
  }
}

module.exports = { seedEducation };
