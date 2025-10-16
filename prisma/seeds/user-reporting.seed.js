const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedUserReporting() {
  try {
    console.log('👥 Seeding user reporting relationships...');
    
    // Clear existing user reporting data
    console.log('🧹 Clearing existing user reporting data...');
    await prisma.userReporting.deleteMany();
    
    // Get all users with their roles
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    // Get all roles with hierarchy
    const roles = await prisma.role.findMany({
      include: {
        parent: true,
        children: true
      }
    });
    
    // Create role hierarchy map
    const roleHierarchyMap = new Map();
    roles.forEach(role => {
      roleHierarchyMap.set(role.name, {
        id: role.id,
        hierarchy: role.hierarchy,
        parentId: role.parentId,
        department: role.department
      });
    });
    
    // Create user-role map
    const userRoleMap = new Map();
    users.forEach(user => {
      if (user.userRoles.length > 0) {
        const primaryRole = user.userRoles[0].role;
        userRoleMap.set(user.email, {
          id: user.id,
          roleName: primaryRole.name,
          hierarchy: primaryRole.hierarchy,
          department: primaryRole.department
        });
      }
    });
    
    console.log(`📊 Found ${users.length} users with roles`);
    
    // Define reporting relationships based on hierarchy
    const reportingRelationships = [];
    
    // Group users by role hierarchy
    const usersByHierarchy = new Map();
    userRoleMap.forEach((userData, email) => {
      if (!usersByHierarchy.has(userData.hierarchy)) {
        usersByHierarchy.set(userData.hierarchy, []);
      }
      usersByHierarchy.get(userData.hierarchy).push({ email, ...userData });
    });
    
    // Create reporting relationships based on hierarchy levels
    // Level 1 (VP) reports to Level 0 (Admin)
    const vpUsers = usersByHierarchy.get(1) || [];
    const adminUsers = usersByHierarchy.get(0) || [];
    
    if (vpUsers.length > 0 && adminUsers.length > 0) {
      // Assign first admin as manager for all VPs
      const adminManager = adminUsers[0];
      vpUsers.forEach(vp => {
        reportingRelationships.push({
          userId: vp.id,
          managerId: adminManager.id,
          isActive: true
        });
      });
    }
    
    // Level 2 (Directors) report to Level 1 (VP)
    const directorUsers = usersByHierarchy.get(2) || [];
    if (directorUsers.length > 0 && vpUsers.length > 0) {
      // Assign first VP as manager for all directors
      const vpManager = vpUsers[0];
      directorUsers.forEach(director => {
        reportingRelationships.push({
          userId: director.id,
          managerId: vpManager.id,
          isActive: true
        });
      });
    }
    
    // Level 3 (Managers) report to Level 2 (Directors) - by department
    const managerUsers = usersByHierarchy.get(3) || [];
    if (managerUsers.length > 0 && directorUsers.length > 0) {
      // Group managers and directors by department
      const managersByDept = new Map();
      const directorsByDept = new Map();
      
      managerUsers.forEach(manager => {
        if (!managersByDept.has(manager.department)) {
          managersByDept.set(manager.department, []);
        }
        managersByDept.get(manager.department).push(manager);
      });
      
      directorUsers.forEach(director => {
        if (!directorsByDept.has(director.department)) {
          directorsByDept.set(director.department, []);
        }
        directorsByDept.get(director.department).push(director);
      });
      
      // Assign directors as managers for their department managers
      managersByDept.forEach((managers, department) => {
        const departmentDirectors = directorsByDept.get(department) || [];
        if (departmentDirectors.length > 0) {
          const directorManager = departmentDirectors[0];
          managers.forEach(manager => {
            reportingRelationships.push({
              userId: manager.id,
              managerId: directorManager.id,
              isActive: true
            });
          });
        }
      });
    }
    
    // Level 4 (Leads) report to Level 3 (Managers) - by department
    const leadUsers = usersByHierarchy.get(4) || [];
    if (leadUsers.length > 0 && managerUsers.length > 0) {
      // Group leads and managers by department
      const leadsByDept = new Map();
      const managersByDept = new Map();
      
      leadUsers.forEach(lead => {
        if (!leadsByDept.has(lead.department)) {
          leadsByDept.set(lead.department, []);
        }
        leadsByDept.get(lead.department).push(lead);
      });
      
      managerUsers.forEach(manager => {
        if (!managersByDept.has(manager.department)) {
          managersByDept.set(manager.department, []);
        }
        managersByDept.get(manager.department).push(manager);
      });
      
      // Assign managers as managers for their department leads
      leadsByDept.forEach((leads, department) => {
        const departmentManagers = managersByDept.get(department) || [];
        if (departmentManagers.length > 0) {
          const managerManager = departmentManagers[0];
          leads.forEach(lead => {
            reportingRelationships.push({
              userId: lead.id,
              managerId: managerManager.id,
              isActive: true
            });
          });
        }
      });
    }
    
    // Level 5 (Individual Contributors) report to Level 4 (Leads) - by department
    const icUsers = usersByHierarchy.get(5) || [];
    if (icUsers.length > 0 && leadUsers.length > 0) {
      // Group ICs and leads by department
      const icsByDept = new Map();
      const leadsByDept = new Map();
      
      icUsers.forEach(ic => {
        if (!icsByDept.has(ic.department)) {
          icsByDept.set(ic.department, []);
        }
        icsByDept.get(ic.department).push(ic);
      });
      
      leadUsers.forEach(lead => {
        if (!leadsByDept.has(lead.department)) {
          leadsByDept.set(lead.department, []);
        }
        leadsByDept.get(lead.department).push(lead);
      });
      
      // Assign leads as managers for their department ICs
      icsByDept.forEach((ics, department) => {
        const departmentLeads = leadsByDept.get(department) || [];
        if (departmentLeads.length > 0) {
          const leadManager = departmentLeads[0];
          ics.forEach(ic => {
            reportingRelationships.push({
              userId: ic.id,
              managerId: leadManager.id,
              isActive: true
            });
          });
        }
      });
    }
    
    console.log(`📋 Created ${reportingRelationships.length} reporting relationships`);
    
    // Create the reporting relationships in database
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const relationship of reportingRelationships) {
      try {
        await prisma.userReporting.create({
          data: relationship
        });
        createdCount++;
      } catch (error) {
        console.warn(`⚠️ Skipped relationship: ${error.message}`);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 User reporting seeding summary:`);
    console.log(`   ✅ Created: ${createdCount} relationships`);
    console.log(`   ⚠️ Skipped: ${skippedCount} relationships`);
    
    // Display hierarchy summary
    console.log(`\n🏢 Organizational hierarchy created:`);
    console.log(`   Level 0 (Admin): ${adminUsers.length} users`);
    console.log(`   Level 1 (VP): ${vpUsers.length} users`);
    console.log(`   Level 2 (Directors): ${directorUsers.length} users`);
    console.log(`   Level 3 (Managers): ${managerUsers.length} users`);
    console.log(`   Level 4 (Leads): ${leadUsers.length} users`);
    console.log(`   Level 5 (ICs): ${icUsers.length} users`);
    
    // Display department breakdown
    console.log(`\n📈 Department breakdown:`);
    const deptCounts = new Map();
    userRoleMap.forEach(userData => {
      if (userData.department) {
        deptCounts.set(userData.department, (deptCounts.get(userData.department) || 0) + 1);
      }
    });
    
    deptCounts.forEach((count, department) => {
      console.log(`   ${department}: ${count} users`);
    });
    
    console.log('\n✅ User reporting relationships seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding user reporting:', error);
    throw error;
  }
}

// Run the seed function if called directly
if (require.main === module) {
  seedUserReporting()
    .then(() => {
      console.log('✅ User reporting seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ User reporting seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedUserReporting };
