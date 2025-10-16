const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../../src/utils/password.utils');

const prisma = new PrismaClient();

// Enhanced user data with role assignments
const usersWithRoles = [
  // Admin Users (Level 0)
  {
    email: 'admin@trivens.com',
    firstName: 'System',
    lastName: 'Administrator',
    password: 'Admin@123',
    isActive: true,
    roleName: 'Admin'
  },
  {
    email: 'superadmin@trivens.com',
    firstName: 'Super',
    lastName: 'Admin',
    password: 'Admin@123',
    isActive: true,
    roleName: 'Admin'
  },
  {
    email: 'admin2@trivens.com',
    firstName: 'John',
    lastName: 'Admin',
    password: 'Admin@123',
    isActive: true,
    roleName: 'Admin'
  },
  {
    email: 'admin3@trivens.com',
    firstName: 'Sarah',
    lastName: 'Admin',
    password: 'Admin@123',
    isActive: true,
    roleName: 'Admin'
  },

  // VP Users (Level 1)
  {
    email: 'vp@trivens.com',
    firstName: 'Michael',
    lastName: 'VP',
    password: 'Password123!',
    isActive: true,
    roleName: 'VP'
  },
  {
    email: 'vp2@trivens.com',
    firstName: 'Jennifer',
    lastName: 'VP',
    password: 'Password123!',
    isActive: true,
    roleName: 'VP'
  },
  {
    email: 'vp3@trivens.com',
    firstName: 'Robert',
    lastName: 'VP',
    password: 'Password123!',
    isActive: true,
    roleName: 'VP'
  },

  // Research Department - RA Director (Level 2)
  {
    email: 'ra.director@trivens.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Director'
  },
  {
    email: 'ra.director2@trivens.com',
    firstName: 'David',
    lastName: 'Wilson',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Director'
  },
  {
    email: 'ra.director3@trivens.com',
    firstName: 'Lisa',
    lastName: 'Brown',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Director'
  },

  // Business Department - BDM Director (Level 2)
  {
    email: 'bdm.director@trivens.com',
    firstName: 'Robert',
    lastName: 'Martinez',
    password: 'Password123!',
    isActive: true,
    roleName: 'BDM Director'
  },
  {
    email: 'bdm.director2@trivens.com',
    firstName: 'Patricia',
    lastName: 'Garcia',
    password: 'Password123!',
    isActive: true,
    roleName: 'BDM Director'
  },
  {
    email: 'bdm.director3@trivens.com',
    firstName: 'William',
    lastName: 'Anderson',
    password: 'Password123!',
    isActive: true,
    roleName: 'BDM Director'
  },

  // Recruitment Department - Recruitment Director (Level 2)
  {
    email: 'recruitment.director@trivens.com',
    firstName: 'Daniel',
    lastName: 'Jackson',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Director'
  },
  {
    email: 'recruitment.director2@trivens.com',
    firstName: 'Elizabeth',
    lastName: 'White',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Director'
  },
  {
    email: 'recruitment.director3@trivens.com',
    firstName: 'Christopher',
    lastName: 'Harris',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Director'
  },

  // Finance Department - Finance Director (Level 2)
  {
    email: 'finance.director@trivens.com',
    firstName: 'Lisa',
    lastName: 'Chen',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Director'
  },
  {
    email: 'finance.director2@trivens.com',
    firstName: 'James',
    lastName: 'Taylor',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Director'
  },
  {
    email: 'finance.director3@trivens.com',
    firstName: 'Amanda',
    lastName: 'Moore',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Director'
  },

  // Research Department - RA Manager (Level 3)
  {
    email: 'ra.manager@trivens.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Manager'
  },
  {
    email: 'ra.manager2@trivens.com',
    firstName: 'Emily',
    lastName: 'Davis',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Manager'
  },
  {
    email: 'ra.manager3@trivens.com',
    firstName: 'Kevin',
    lastName: 'Miller',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Manager'
  },
  {
    email: 'ra.manager4@trivens.com',
    firstName: 'Rachel',
    lastName: 'Thompson',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Manager'
  },

  // Business Department - Sr BDM Director (Level 3)
  {
    email: 'sr.bdm.director@trivens.com',
    firstName: 'Thomas',
    lastName: 'Clark',
    password: 'Password123!',
    isActive: true,
    roleName: 'Sr BDM Director'
  },
  {
    email: 'sr.bdm.director2@trivens.com',
    firstName: 'Jessica',
    lastName: 'Lewis',
    password: 'Password123!',
    isActive: true,
    roleName: 'Sr BDM Director'
  },
  {
    email: 'sr.bdm.director3@trivens.com',
    firstName: 'Andrew',
    lastName: 'Walker',
    password: 'Password123!',
    isActive: true,
    roleName: 'Sr BDM Director'
  },
  {
    email: 'sr.bdm.director4@trivens.com',
    firstName: 'Stephanie',
    lastName: 'Hall',
    password: 'Password123!',
    isActive: true,
    roleName: 'Sr BDM Director'
  },

  // Recruitment Department - Recruitment Manager (Level 3)
  {
    email: 'recruitment.manager@trivens.com',
    firstName: 'Michelle',
    lastName: 'White',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Manager'
  },
  {
    email: 'recruitment.manager2@trivens.com',
    firstName: 'Ryan',
    lastName: 'Allen',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Manager'
  },
  {
    email: 'recruitment.manager3@trivens.com',
    firstName: 'Nicole',
    lastName: 'Young',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Manager'
  },
  {
    email: 'recruitment.manager4@trivens.com',
    firstName: 'Brandon',
    lastName: 'King',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Manager'
  },

  // Finance Department - Finance Manager (Level 3)
  {
    email: 'finance.manager@trivens.com',
    firstName: 'Mark',
    lastName: 'Wright',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Manager'
  },
  {
    email: 'finance.manager2@trivens.com',
    firstName: 'Laura',
    lastName: 'Lopez',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Manager'
  },
  {
    email: 'finance.manager3@trivens.com',
    firstName: 'Steven',
    lastName: 'Hill',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Manager'
  },
  {
    email: 'finance.manager4@trivens.com',
    firstName: 'Samantha',
    lastName: 'Scott',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Manager'
  },

  // Research Department - RA Lead (Level 4)
  {
    email: 'ra.lead@trivens.com',
    firstName: 'Emily',
    lastName: 'Davis',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Lead'
  },
  {
    email: 'ra.lead2@trivens.com',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Lead'
  },
  {
    email: 'ra.lead3@trivens.com',
    firstName: 'Maria',
    lastName: 'Martinez',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Lead'
  },
  {
    email: 'ra.lead4@trivens.com',
    firstName: 'Carlos',
    lastName: 'Garcia',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA Lead'
  },

  // Business Department - BDM (Level 4)
  {
    email: 'bdm@trivens.com',
    firstName: 'John',
    lastName: 'Smith',
    password: 'Password123!',
    isActive: true,
    roleName: 'BDM'
  },
  {
    email: 'bdm2@trivens.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    password: 'Password123!',
    isActive: true,
    roleName: 'BDM'
  },
  {
    email: 'bdm3@trivens.com',
    firstName: 'Mike',
    lastName: 'Davis',
    password: 'Password123!',
    isActive: true,
    roleName: 'BDM'
  },
  {
    email: 'bdm4@trivens.com',
    firstName: 'Lisa',
    lastName: 'Wilson',
    password: 'Password123!',
    isActive: true,
    roleName: 'BDM'
  },

  // Recruitment Department - Recruitment Lead (Level 4)
  {
    email: 'recruitment.lead@trivens.com',
    firstName: 'David',
    lastName: 'Brown',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Lead'
  },
  {
    email: 'recruitment.lead2@trivens.com',
    firstName: 'Emma',
    lastName: 'Taylor',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Lead'
  },
  {
    email: 'recruitment.lead3@trivens.com',
    firstName: 'Alex',
    lastName: 'Garcia',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Lead'
  },
  {
    email: 'recruitment.lead4@trivens.com',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruitment Lead'
  },

  // Finance Department - Finance Lead (Level 4)
  {
    email: 'finance.lead@trivens.com',
    firstName: 'James',
    lastName: 'Lee',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Lead'
  },
  {
    email: 'finance.lead2@trivens.com',
    firstName: 'Jennifer',
    lastName: 'White',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Lead'
  },
  {
    email: 'finance.lead3@trivens.com',
    firstName: 'Robert',
    lastName: 'Miller',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Lead'
  },
  {
    email: 'finance.lead4@trivens.com',
    firstName: 'Patricia',
    lastName: 'Moore',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Lead'
  },

  // Research Department - RA (Level 5)
  {
    email: 'ra@trivens.com',
    firstName: 'David',
    lastName: 'Brown',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA'
  },
  {
    email: 'ra2@trivens.com',
    firstName: 'Sophia',
    lastName: 'Garcia',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA'
  },
  {
    email: 'ra3@trivens.com',
    firstName: 'Ethan',
    lastName: 'Martinez',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA'
  },
  {
    email: 'ra4@trivens.com',
    firstName: 'Olivia',
    lastName: 'Anderson',
    password: 'Password123!',
    isActive: true,
    roleName: 'RA'
  },

  // Recruitment Department - Recruiter (Level 5)
  {
    email: 'recruiter@trivens.com',
    firstName: 'Kevin',
    lastName: 'Harris',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruiter'
  },
  {
    email: 'recruiter2@trivens.com',
    firstName: 'Ashley',
    lastName: 'Thompson',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruiter'
  },
  {
    email: 'recruiter3@trivens.com',
    firstName: 'Daniel',
    lastName: 'Jackson',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruiter'
  },
  {
    email: 'recruiter4@trivens.com',
    firstName: 'Michelle',
    lastName: 'White',
    password: 'Password123!',
    isActive: true,
    roleName: 'Recruiter'
  },

  // Finance Department - Finance Analyst (Level 5)
  {
    email: 'finance.analyst@trivens.com',
    firstName: 'William',
    lastName: 'Anderson',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Analyst'
  },
  {
    email: 'finance.analyst2@trivens.com',
    firstName: 'Elizabeth',
    lastName: 'Thomas',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Analyst'
  },
  {
    email: 'finance.analyst3@trivens.com',
    firstName: 'Michael',
    lastName: 'Jackson',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Analyst'
  },
  {
    email: 'finance.analyst4@trivens.com',
    firstName: 'Jessica',
    lastName: 'Martin',
    password: 'Password123!',
    isActive: true,
    roleName: 'Finance Analyst'
  },

  // Inactive Users (for testing)
  {
    email: 'inactive.user@trivens.com',
    firstName: 'Inactive',
    lastName: 'User',
    password: 'Password123!',
    isActive: false,
    roleName: 'RA'
  },
  {
    email: 'inactive.recruiter@trivens.com',
    firstName: 'Inactive',
    lastName: 'Recruiter',
    password: 'Password123!',
    isActive: false,
    roleName: 'Recruiter'
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Seeding users with enhanced RBAC roles...');
    
    // Get all roles from database
    const roles = await prisma.role.findMany();
    const roleMap = new Map(roles.map(role => [role.name, role]));
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const userData of usersWithRoles) {
      const { roleName, ...userInfo } = userData;
      
      // Find the role
      const role = roleMap.get(roleName);
      if (!role) {
        console.warn(`⚠️ Role '${roleName}' not found, skipping user ${userData.email}`);
        skippedCount++;
        continue;
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userInfo.password);
      
      try {
        // Create user
        const user = await prisma.user.upsert({
          where: { email: userInfo.email },
        update: {
            ...userInfo,
          password: hashedPassword
        },
        create: {
            ...userInfo,
          password: hashedPassword
        }
      });
        
        // Assign role to user
        await prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: role.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            roleId: role.id
          }
        });
        
        createdCount++;
        console.log(`✅ Created user: ${userInfo.email} with role: ${roleName}`);
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 User seeding summary:`);
    console.log(`   ✅ Created/Updated: ${createdCount} users`);
    console.log(`   ⚠️ Skipped: ${skippedCount} users`);
    console.log(`   📧 Total users: ${usersWithRoles.length}`);
    
    // Display role distribution
    console.log(`\n👥 Role distribution:`);
    const roleCounts = {};
    usersWithRoles.forEach(user => {
      roleCounts[user.roleName] = (roleCounts[user.roleName] || 0) + 1;
    });
    
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
    console.log(`\n🔑 Default login credentials:`);
    console.log(`   Admin: admin@trivens.com / Admin@123`);
    console.log(`   VP: vp@trivens.com / Password123!`);
    console.log(`   BDM: bdm@trivens.com / Password123!`);
    console.log(`   Recruiter: recruiter@trivens.com / Password123!`);
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

// Run the seed function if called directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('✅ User seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ User seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedUsers };