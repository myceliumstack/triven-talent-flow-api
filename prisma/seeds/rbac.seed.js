const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../../src/utils/password.utils');

const prisma = new PrismaClient();

async function seedRBAC() {
  try {
    console.log('🔐 Seeding RBAC system...');
    
    // Clear existing RBAC data
    console.log('🧹 Clearing existing RBAC data...');
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    
    // Create Permissions
    console.log('📝 Creating permissions...');
    const permissions = [
      // Job Posting Permissions
      { name: 'job_posting.create', resource: 'job_posting', action: 'create', description: 'Create new job postings' },
      { name: 'job_posting.read', resource: 'job_posting', action: 'read', description: 'Read job postings' },
      { name: 'job_posting.update', resource: 'job_posting', action: 'update', description: 'Update job postings' },
      { name: 'job_posting.delete', resource: 'job_posting', action: 'delete', description: 'Delete job postings' },
      { name: 'job_posting.manage', resource: 'job_posting', action: 'manage', description: 'Full job posting management' },

      // Candidate Permissions
      { name: 'candidate.create', resource: 'candidate', action: 'create', description: 'Create new candidates' },
      { name: 'candidate.read', resource: 'candidate', action: 'read', description: 'Read candidates' },
      { name: 'candidate.update', resource: 'candidate', action: 'update', description: 'Update candidates' },
      { name: 'candidate.delete', resource: 'candidate', action: 'delete', description: 'Delete candidates' },
      { name: 'candidate.manage', resource: 'candidate', action: 'manage', description: 'Full candidate management' },

      // Company Permissions
      { name: 'company.create', resource: 'company', action: 'create', description: 'Create new companies' },
      { name: 'company.read', resource: 'company', action: 'read', description: 'Read companies' },
      { name: 'company.update', resource: 'company', action: 'update', description: 'Update companies' },
      { name: 'company.delete', resource: 'company', action: 'delete', description: 'Delete companies' },
      { name: 'company.manage', resource: 'company', action: 'manage', description: 'Full company management' },

      // Metrics Permissions
      { name: 'metrics.view_department', resource: 'metrics', action: 'view_department', description: 'View department metrics' },
      { name: 'metrics.view_all', resource: 'metrics', action: 'view_all', description: 'View all metrics' },
      { name: 'metrics.export', resource: 'metrics', action: 'export', description: 'Export metrics' },

      // User Management Permissions
      { name: 'user.create', resource: 'user', action: 'create', description: 'Create new users' },
      { name: 'user.read', resource: 'user', action: 'read', description: 'Read users' },
      { name: 'user.update', resource: 'user', action: 'update', description: 'Update users' },
      { name: 'user.delete', resource: 'user', action: 'delete', description: 'Delete users' },
      { name: 'user.manage', resource: 'user', action: 'manage', description: 'Full user management' },

      // Role Management Permissions
      { name: 'role.create', resource: 'role', action: 'create', description: 'Create new roles' },
      { name: 'role.read', resource: 'role', action: 'read', description: 'Read roles' },
      { name: 'role.update', resource: 'role', action: 'update', description: 'Update roles' },
      { name: 'role.delete', resource: 'role', action: 'delete', description: 'Delete roles' },
      { name: 'role.manage', resource: 'role', action: 'manage', description: 'Full role management' },

      // Assignment Permissions
      { name: 'assignment.create', resource: 'assignment', action: 'create', description: 'Create assignments' },
      { name: 'assignment.read', resource: 'assignment', action: 'read', description: 'Read assignments' },
      { name: 'assignment.update', resource: 'assignment', action: 'update', description: 'Update assignments' },
      { name: 'assignment.delete', resource: 'assignment', action: 'delete', description: 'Delete assignments' },
      { name: 'assignment.manage', resource: 'assignment', action: 'manage', description: 'Full assignment management' }
    ];

    const createdPermissions = await Promise.all(
      permissions.map(permission => prisma.permission.create({ data: permission }))
    );

    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // Create Roles with Hierarchy
    console.log('👥 Creating roles with hierarchy...');
    const roles = [
      // Level 0 - Admin
      { name: 'Admin', description: 'Full system access with all permissions', hierarchy: 0, department: null },
      
      // Level 1 - VP
      { name: 'VP', description: 'Vice President - can view all department metrics', hierarchy: 1, department: null },

      // Level 2 - Directors
      { name: 'RA Director', description: 'Research Department Director', hierarchy: 2, department: 'Research' },
      { name: 'BDM Director', description: 'Business Development Director', hierarchy: 2, department: 'Business' },
      { name: 'Recruitment Director', description: 'Recruitment Department Director', hierarchy: 2, department: 'Recruitment' },
      { name: 'Finance Director', description: 'Finance Department Director', hierarchy: 2, department: 'Finance' },

      // Level 3 - Managers
      { name: 'RA Manager', description: 'Research Department Manager', hierarchy: 3, department: 'Research' },
      { name: 'Sr BDM Director', description: 'Senior Business Development Director', hierarchy: 3, department: 'Business' },
      { name: 'Recruitment Manager', description: 'Recruitment Department Manager', hierarchy: 3, department: 'Recruitment' },
      { name: 'Finance Manager', description: 'Finance Department Manager', hierarchy: 3, department: 'Finance' },

      // Level 4 - Leads
      { name: 'RA Lead', description: 'Research Department Team Lead', hierarchy: 4, department: 'Research' },
      { name: 'BDM', description: 'Business Development Manager', hierarchy: 4, department: 'Business' },
      { name: 'Recruitment Lead', description: 'Recruitment Department Team Lead', hierarchy: 4, department: 'Recruitment' },
      { name: 'Finance Lead', description: 'Finance Department Team Lead', hierarchy: 4, department: 'Finance' },

      // Level 5 - Individual Contributors
      { name: 'RA', description: 'Research Associate', hierarchy: 5, department: 'Research' },
      { name: 'Recruiter', description: 'Recruitment Specialist', hierarchy: 5, department: 'Recruitment' },
      { name: 'Finance Analyst', description: 'Finance Department Analyst', hierarchy: 5, department: 'Finance' }
    ];

    // Create roles
    const createdRoles = await Promise.all(
      roles.map(roleData => prisma.role.create({ data: roleData }))
    );

    // Set up hierarchy relationships
    const adminRole = createdRoles.find(r => r.name === 'Admin');
    const vpRole = createdRoles.find(r => r.name === 'VP');
    const raDirectorRole = createdRoles.find(r => r.name === 'RA Director');
    const bdmDirectorRole = createdRoles.find(r => r.name === 'BDM Director');
    const recruitmentDirectorRole = createdRoles.find(r => r.name === 'Recruitment Director');
    const financeDirectorRole = createdRoles.find(r => r.name === 'Finance Director');
    const raManagerRole = createdRoles.find(r => r.name === 'RA Manager');
    const srBdmDirectorRole = createdRoles.find(r => r.name === 'Sr BDM Director');
    const recruitmentManagerRole = createdRoles.find(r => r.name === 'Recruitment Manager');
    const financeManagerRole = createdRoles.find(r => r.name === 'Finance Manager');
    const raLeadRole = createdRoles.find(r => r.name === 'RA Lead');
    const bdmRole = createdRoles.find(r => r.name === 'BDM');
    const recruitmentLeadRole = createdRoles.find(r => r.name === 'Recruitment Lead');
    const financeLeadRole = createdRoles.find(r => r.name === 'Finance Lead');
    const raRole = createdRoles.find(r => r.name === 'RA');
    const recruiterRole = createdRoles.find(r => r.name === 'Recruiter');
    const financeAnalystRole = createdRoles.find(r => r.name === 'Finance Analyst');

    // Update parent relationships
    await prisma.role.update({ where: { id: vpRole.id }, data: { parentId: adminRole.id } });
    await prisma.role.update({ where: { id: raDirectorRole.id }, data: { parentId: vpRole.id } });
    await prisma.role.update({ where: { id: bdmDirectorRole.id }, data: { parentId: vpRole.id } });
    await prisma.role.update({ where: { id: recruitmentDirectorRole.id }, data: { parentId: vpRole.id } });
    await prisma.role.update({ where: { id: financeDirectorRole.id }, data: { parentId: vpRole.id } });
    await prisma.role.update({ where: { id: raManagerRole.id }, data: { parentId: raDirectorRole.id } });
    await prisma.role.update({ where: { id: srBdmDirectorRole.id }, data: { parentId: bdmDirectorRole.id } });
    await prisma.role.update({ where: { id: recruitmentManagerRole.id }, data: { parentId: recruitmentDirectorRole.id } });
    await prisma.role.update({ where: { id: financeManagerRole.id }, data: { parentId: financeDirectorRole.id } });
    await prisma.role.update({ where: { id: raLeadRole.id }, data: { parentId: raManagerRole.id } });
    await prisma.role.update({ where: { id: bdmRole.id }, data: { parentId: srBdmDirectorRole.id } });
    await prisma.role.update({ where: { id: recruitmentLeadRole.id }, data: { parentId: recruitmentManagerRole.id } });
    await prisma.role.update({ where: { id: financeLeadRole.id }, data: { parentId: financeManagerRole.id } });
    await prisma.role.update({ where: { id: raRole.id }, data: { parentId: raLeadRole.id } });
    await prisma.role.update({ where: { id: recruiterRole.id }, data: { parentId: recruitmentLeadRole.id } });
    await prisma.role.update({ where: { id: financeAnalystRole.id }, data: { parentId: financeLeadRole.id } });

    console.log(`✅ Created ${createdRoles.length} roles with hierarchy`);

    // Assign Permissions to Roles
    console.log('🔗 Assigning permissions to roles...');

    const rolePermissionAssignments = [
      // Admin gets ALL permissions
      { roleName: 'Admin', permissions: [
        'job_posting.create', 'job_posting.read', 'job_posting.update', 'job_posting.delete', 'job_posting.manage',
        'candidate.create', 'candidate.read', 'candidate.update', 'candidate.delete', 'candidate.manage',
        'company.create', 'company.read', 'company.update', 'company.delete', 'company.manage',
        'metrics.view_department', 'metrics.view_all', 'metrics.export',
        'user.create', 'user.read', 'user.update', 'user.delete', 'user.manage',
        'role.create', 'role.read', 'role.update', 'role.delete', 'role.manage',
        'assignment.create', 'assignment.read', 'assignment.update', 'assignment.delete', 'assignment.manage'
      ]},

      // VP gets cross-department permissions
      { roleName: 'VP', permissions: [
        'metrics.view_all', 'job_posting.read', 'candidate.read', 'company.read', 'assignment.read'
      ]},

      // Research Department
      { roleName: 'RA Director', permissions: [
        'job_posting.manage', 'candidate.manage', 'metrics.view_department', 'assignment.manage'
      ]},
      { roleName: 'RA Manager', permissions: [
        'job_posting.create', 'job_posting.read', 'job_posting.update',
        'candidate.create', 'candidate.read', 'candidate.update',
        'assignment.create', 'assignment.read', 'assignment.update'
      ]},
      { roleName: 'RA Lead', permissions: [
        'job_posting.create', 'job_posting.read', 'job_posting.update',
        'candidate.create', 'candidate.read', 'candidate.update',
        'assignment.create', 'assignment.read'
      ]},
      { roleName: 'RA', permissions: [
        'job_posting.read', 'candidate.read', 'assignment.read'
      ]},

      // Business Department
      { roleName: 'BDM Director', permissions: [
        'company.manage', 'job_posting.read', 'metrics.view_department'
      ]},
      { roleName: 'Sr BDM Director', permissions: [
        'company.create', 'company.read', 'company.update', 'job_posting.read'
      ]},
      { roleName: 'BDM', permissions: [
        'company.create', 'company.read', 'company.update', 'job_posting.read'
      ]},

      // Recruitment Department
      { roleName: 'Recruitment Director', permissions: [
        'candidate.manage', 'job_posting.read', 'assignment.manage', 'metrics.view_department'
      ]},
      { roleName: 'Recruitment Manager', permissions: [
        'candidate.create', 'candidate.read', 'candidate.update',
        'assignment.create', 'assignment.read', 'assignment.update'
      ]},
      { roleName: 'Recruitment Lead', permissions: [
        'candidate.create', 'candidate.read', 'candidate.update',
        'assignment.create', 'assignment.read'
      ]},
      { roleName: 'Recruiter', permissions: [
        'candidate.create', 'candidate.read', 'candidate.update', 'assignment.read'
      ]},

      // Finance Department
      { roleName: 'Finance Director', permissions: [
        'metrics.view_department', 'company.read', 'assignment.read'
      ]},
      { roleName: 'Finance Manager', permissions: [
        'company.read', 'assignment.read'
      ]},
      { roleName: 'Finance Lead', permissions: [
        'company.read', 'assignment.read'
      ]},
      { roleName: 'Finance Analyst', permissions: [
        'company.read', 'assignment.read'
      ]}
    ];

    let totalAssignments = 0;
    for (const assignment of rolePermissionAssignments) {
      const role = createdRoles.find(r => r.name === assignment.roleName);
      if (!role) continue;

      for (const permissionName of assignment.permissions) {
        const permission = createdPermissions.find(p => p.name === permissionName);
        if (!permission) continue;

        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id }
        });
        totalAssignments++;
      }
    }

    console.log(`✅ Created ${totalAssignments} role-permission assignments`);

    // Create Default Admin User
    console.log('👤 Creating default admin user...');
    
    const hashedPassword = await hashPassword('Admin@123');
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@trivens.com' },
      update: {
        firstName: 'System',
        lastName: 'Administrator',
        password: hashedPassword,
        isActive: true
      },
      create: {
        email: 'admin@trivens.com',
        firstName: 'System',
        lastName: 'Administrator',
        password: hashedPassword,
        isActive: true
      }
    });

    // Assign admin role to admin user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    console.log('✅ Default admin user created');
    console.log('📧 Email: admin@trivens.com');
    console.log('🔑 Password: Admin@123');

    console.log('\n🎉 RBAC system seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • ${createdPermissions.length} permissions created`);
    console.log(`   • ${createdRoles.length} roles created with hierarchy`);
    console.log(`   • ${totalAssignments} role-permission assignments`);
    console.log(`   • 1 admin user created`);

  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
    throw error;
  }
}

// Run the seed function if called directly
if (require.main === module) {
  seedRBAC()
    .then(() => {
      console.log('✅ RBAC seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ RBAC seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedRBAC };
