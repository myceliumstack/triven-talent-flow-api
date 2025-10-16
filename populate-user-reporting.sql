-- Populate UserReporting table based on existing user roles and hierarchy
-- This script creates reporting relationships based on role hierarchy levels

-- Clear existing data
DELETE FROM user_reporting;

-- Insert reporting relationships based on role hierarchy
-- Level 1 (VP) reports to Level 0 (Admin)
INSERT INTO user_reporting (id, user_id, manager_id, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid()::text as id,
    u.id as user_id,
    admin_user.id as manager_id,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
JOIN user_roles ur ON u.id = ur."userId"
JOIN roles r ON ur."roleId" = r.id
CROSS JOIN (
    SELECT u2.id 
    FROM users u2
    JOIN user_roles ur2 ON u2.id = ur2."userId"
    JOIN roles r2 ON ur2."roleId" = r2.id
    WHERE r2.name = 'Admin' AND r2.hierarchy = 0
    LIMIT 1
) admin_user
WHERE r.name = 'VP' AND r.hierarchy = 1
AND u.is_active = true;

-- Level 2 (Directors) report to Level 1 (VP)
INSERT INTO user_reporting (id, user_id, manager_id, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid()::text as id,
    u.id as user_id,
    vp_user.id as manager_id,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
JOIN user_roles ur ON u.id = ur."userId"
JOIN roles r ON ur."roleId" = r.id
CROSS JOIN (
    SELECT u2.id 
    FROM users u2
    JOIN user_roles ur2 ON u2.id = ur2."userId"
    JOIN roles r2 ON ur2."roleId" = r2.id
    WHERE r2.name = 'VP' AND r2.hierarchy = 1
    LIMIT 1
) vp_user
WHERE r.hierarchy = 2 
AND r.name IN ('RA Director', 'BDM Director', 'Recruitment Director', 'Finance Director')
AND u.is_active = true;

-- Level 3 (Managers) report to Level 2 (Directors) - by department
INSERT INTO user_reporting (id, user_id, manager_id, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid()::text as id,
    u.id as user_id,
    director_user.id as manager_id,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
JOIN user_roles ur ON u.id = ur."userId"
JOIN roles r ON ur."roleId" = r.id
JOIN (
    SELECT u2.id, r2.department
    FROM users u2
    JOIN user_roles ur2 ON u2.id = ur2."userId"
    JOIN roles r2 ON ur2."roleId" = r2.id
    WHERE r2.hierarchy = 2 
    AND r2.name IN ('RA Director', 'BDM Director', 'Recruitment Director', 'Finance Director')
) director_user ON r.department = director_user.department
WHERE r.hierarchy = 3 
AND r.name IN ('RA Manager', 'Sr BDM Director', 'Recruitment Manager', 'Finance Manager')
AND u.is_active = true;

-- Level 4 (Leads) report to Level 3 (Managers) - by department
INSERT INTO user_reporting (id, user_id, manager_id, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid()::text as id,
    u.id as user_id,
    manager_user.id as manager_id,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
JOIN user_roles ur ON u.id = ur."userId"
JOIN roles r ON ur."roleId" = r.id
JOIN (
    SELECT u2.id, r2.department
    FROM users u2
    JOIN user_roles ur2 ON u2.id = ur2."userId"
    JOIN roles r2 ON ur2."roleId" = r2.id
    WHERE r2.hierarchy = 3 
    AND r2.name IN ('RA Manager', 'Sr BDM Director', 'Recruitment Manager', 'Finance Manager')
) manager_user ON r.department = manager_user.department
WHERE r.hierarchy = 4 
AND r.name IN ('RA Lead', 'BDM', 'Recruitment Lead', 'Finance Lead')
AND u.is_active = true;

-- Level 5 (Individual Contributors) report to Level 4 (Leads) - by department
INSERT INTO user_reporting (id, user_id, manager_id, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid()::text as id,
    u.id as user_id,
    lead_user.id as manager_id,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
JOIN user_roles ur ON u.id = ur."userId"
JOIN roles r ON ur."roleId" = r.id
JOIN (
    SELECT u2.id, r2.department
    FROM users u2
    JOIN user_roles ur2 ON u2.id = ur2."userId"
    JOIN roles r2 ON ur2."roleId" = r2.id
    WHERE r2.hierarchy = 4 
    AND r2.name IN ('RA Lead', 'BDM', 'Recruitment Lead', 'Finance Lead')
) lead_user ON r.department = lead_user.department
WHERE r.hierarchy = 5 
AND r.name IN ('RA', 'Recruiter', 'Finance Analyst')
AND u.is_active = true;

-- Display summary
SELECT 
    'User Reporting Relationships Created' as summary,
    COUNT(*) as total_relationships
FROM user_reporting;

-- Display hierarchy breakdown
SELECT 
    'Hierarchy Level' as level_type,
    r.hierarchy,
    r.name as role_name,
    COUNT(ur.id) as user_count,
    COUNT(urep.id) as reporting_relationships
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur."roleId"
LEFT JOIN users u ON ur."userId" = u.id AND u.is_active = true
LEFT JOIN user_reporting urep ON u.id = urep.user_id
GROUP BY r.hierarchy, r.name
ORDER BY r.hierarchy, r.name;
