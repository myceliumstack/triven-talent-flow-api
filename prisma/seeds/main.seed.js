// prisma/seeds/main.seed.js
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../../src/utils/password.utils');

// Import seed functions
const { seedCompanies } = require('./company.seed');
const { seedPOCs } = require('./poc.seed');
const { seedJobPostings } = require('./job-posting.seed');
const { seedJobPostingStatuses } = require('./job-posting-status.seed');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await prisma.jobPosting.deleteMany();
    await prisma.jobPostingStatus.deleteMany();
    await prisma.pOC.deleteMany();
    await prisma.company.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();

    // Seed User Management System
    console.log('\n👑 Seeding user management system...');
    await seedUserManagement();

    // Seed Job Posting Statuses (independent)
    console.log('\n🏷️ Seeding job posting statuses...');
    const jobPostingStatuses = await seedJobPostingStatuses();

    // Seed Companies
    console.log('\n🏢 Seeding companies...');
    const companies = await seedCompanies();

    // Seed POCs (depends on companies)
    console.log('\n👥 Seeding POCs...');
    const pocs = await seedPOCs(companies);

    // Seed Job Postings (depends on companies and statuses)
    console.log('\n💼 Seeding job postings...');
    const jobPostings = await seedJobPostings(companies, jobPostingStatuses);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: 1 (admin)`);
    console.log(`   - Roles: 7`);
    console.log(`   - Permissions: 13`);
    console.log(`   - Job Posting Statuses: ${jobPostingStatuses.length}`);
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - POCs: ${pocs.length}`);
    console.log(`   - Job Postings: ${jobPostings.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function seedUserManagement() {
  // Create roles with hierarchy
  console.log('👑 Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Admin',
        description: 'Full system access with all permissions',
        hierarchy: 0
      }
    }),
    prisma.role.create({
      data: {
        name: 'RA Manager',
        description: 'Research Analyst Manager with team oversight',
        hierarchy: 1
      }
    }),
    prisma.role.create({
      data: {
        name: 'Team Manager',
        description: 'Team management and coordination',
        hierarchy: 2
      }
    }),
    prisma.role.create({
      data: {
        name: 'BDM',
        description: 'Business Development Manager',
        hierarchy: 3
      }
    }),
    prisma.role.create({
      data: {
        name: 'Recruiter',
        description: 'Primary recruitment responsibilities',
        hierarchy: 4
      }
    }),
    prisma.role.create({
      data: {
        name: 'Co-Recruiter',
        description: 'Secondary recruitment support',
        hierarchy: 5
      }
    }),
    prisma.role.create({
      data: {
        name: 'Research Analyst',
        description: 'Research and analysis tasks',
        hierarchy: 6
      }
    })
  ]);

  console.log('✅ Roles created:', roles.map(r => r.name));

  // Create permissions
  console.log('🔐 Creating permissions...');
  const permissions = await Promise.all([
    // User management permissions
    prisma.permission.create({ data: { name: 'create_user', resource: 'user', action: 'create' } }),
    prisma.permission.create({ data: { name: 'read_user', resource: 'user', action: 'read' } }),
    prisma.permission.create({ data: { name: 'update_user', resource: 'user', action: 'update' } }),
    prisma.permission.create({ data: { name: 'delete_user', resource: 'user', action: 'delete' } }),
    
    // Role management permissions
    prisma.permission.create({ data: { name: 'assign_role', resource: 'role', action: 'assign' } }),
    prisma.permission.create({ data: { name: 'revoke_role', resource: 'role', action: 'revoke' } }),
    
    // System access permissions
    prisma.permission.create({ data: { name: 'admin_panel', resource: 'system', action: 'admin' } }),
    prisma.permission.create({ data: { name: 'view_reports', resource: 'reports', action: 'read' } }),
    prisma.permission.create({ data: { name: 'view_analytics', resource: 'analytics', action: 'read' } }),
    
    // Recruitment permissions
    prisma.permission.create({ data: { name: 'create_candidate', resource: 'candidate', action: 'create' } }),
    prisma.permission.create({ data: { name: 'view_candidates', resource: 'candidate', action: 'read' } }),
    prisma.permission.create({ data: { name: 'update_candidates', resource: 'candidate', action: 'update' } }),
    
    // Research permissions
    prisma.permission.create({ data: { name: 'view_research', resource: 'research', action: 'read' } }),
    prisma.permission.create({ data: { name: 'create_research', resource: 'research', action: 'create' } }),
    prisma.permission.create({ data: { name: 'update_research', resource: 'research', action: 'update' } })
  ]);

  console.log('✅ Permissions created:', permissions.length);

  // Create role-permission mappings
  console.log('🔗 Creating role-permission mappings...');
  
  // Admin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: roles.find(r => r.name === 'Admin').id,
        permissionId: permission.id
      }
    });
  }

  // RA Manager permissions
  const raManagerRole = roles.find(r => r.name === 'RA Manager');
  const raManagerPermissions = [
    'read_user', 'update_user', 'view_reports', 'view_analytics',
    'view_candidates', 'update_candidates', 'view_research', 'create_research', 'update_research'
  ];
  
  for (const permName of raManagerPermissions) {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: raManagerRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  // Team Manager permissions
  const teamManagerRole = roles.find(r => r.name === 'Team Manager');
  const teamManagerPermissions = [
    'read_user', 'update_user', 'assign_role', 'view_reports',
    'view_candidates', 'update_candidates', 'view_research'
  ];
  
  for (const permName of teamManagerPermissions) {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: teamManagerRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  // BDM permissions
  const bdmRole = roles.find(r => r.name === 'BDM');
  const bdmPermissions = [
    'read_user', 'view_reports', 'view_candidates', 'update_candidates'
  ];
  
  for (const permName of bdmPermissions) {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: bdmRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  // Recruiter permissions
  const recruiterRole = roles.find(r => r.name === 'Recruiter');
  const recruiterPermissions = [
    'read_user', 'view_candidates', 'update_candidates', 'view_research'
  ];
  
  for (const permName of recruiterPermissions) {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: recruiterRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  // Co-Recruiter permissions
  const coRecruiterRole = roles.find(r => r.name === 'Co-Recruiter');
  const coRecruiterPermissions = [
    'read_user', 'view_candidates', 'view_research'
  ];
  
  for (const permName of coRecruiterPermissions) {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: coRecruiterRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  // Research Analyst permissions
  const raRole = roles.find(r => r.name === 'Research Analyst');
  const raPermissions = [
    'read_user', 'view_research', 'create_research', 'update_research'
  ];
  
  for (const permName of raPermissions) {
    const permission = permissions.find(p => p.name === permName);
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: raRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  console.log('✅ Role-permission mappings created');

  // Create default admin user
  console.log('👤 Creating default admin user...');
  const adminPassword = await hashPassword('Admin@123');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@trivens.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator'
    }
  });

  // Assign admin role to admin user
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: roles.find(r => r.name === 'Admin').id
    }
  });

  console.log('✅ Default admin user created');
  console.log('📧 Email: admin@trivens.com');
  console.log('🔑 Password: Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
