-- Samay Platform - Demo Data Seed Script
-- Run this script to populate the database with demo accounts
-- 
-- Super Admin Account:
--   Email: admin@samay.io
--   Password: admin123
--
-- Manager Account:
--   Email: manager@samay.io
--   Password: manager123
--
-- Associate Account:
--   Email: associate@samay.io
--   Password: associate123
--
-- Note: In production, implement proper password hashing with bcrypt

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_type_enum AS ENUM ('PREFERRED', 'NEUTRAL', 'AVOIDED', 'BLACKOUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_status_enum AS ENUM ('OPEN', 'ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- SKILLS - Create sample skills
-- =====================================================
INSERT INTO skills (id, code, name, description, "isActive", "createdAt")
VALUES 
    ('a0000001-0000-0000-0000-000000000001', 'skill_forklift', 'Forklift Certified', 'Licensed to operate forklift machinery', true, NOW()),
    ('a0000001-0000-0000-0000-000000000002', 'skill_cashier', 'Cashier', 'Cash register and POS operation', true, NOW()),
    ('a0000001-0000-0000-0000-000000000003', 'skill_inventory', 'Inventory Management', 'Stock counting and warehouse organization', true, NOW()),
    ('a0000001-0000-0000-0000-000000000004', 'skill_customer_service', 'Customer Service', 'Customer facing support and assistance', true, NOW()),
    ('a0000001-0000-0000-0000-000000000005', 'skill_supervisor', 'Supervisor', 'Team supervision and management', true, NOW()),
    ('a0000001-0000-0000-0000-000000000006', 'skill_opening', 'Opening Procedures', 'Store opening and morning setup', true, NOW()),
    ('a0000001-0000-0000-0000-000000000007', 'skill_closing', 'Closing Procedures', 'Store closing and end-of-day procedures', true, NOW())
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TEAMS - Create sample teams
-- =====================================================
INSERT INTO teams (id, name, description, "isActive", settings, "createdAt", "updatedAt")
VALUES 
    ('b0000001-0000-0000-0000-000000000001', 'Morning Crew', 'Handles morning shifts from 6 AM to 2 PM', true, '{"shiftStart": "06:00", "shiftEnd": "14:00"}', NOW(), NOW()),
    ('b0000001-0000-0000-0000-000000000002', 'Evening Crew', 'Handles evening shifts from 2 PM to 10 PM', true, '{"shiftStart": "14:00", "shiftEnd": "22:00"}', NOW(), NOW()),
    ('b0000001-0000-0000-0000-000000000003', 'Night Shift', 'Handles overnight shifts from 10 PM to 6 AM', true, '{"shiftStart": "22:00", "shiftEnd": "06:00"}', NOW(), NOW()),
    ('b0000001-0000-0000-0000-000000000004', 'Weekend Team', 'Weekend coverage team', true, '{"weekend_only": true}', NOW(), NOW()),
    ('b0000001-0000-0000-0000-000000000005', 'Warehouse A', 'Primary warehouse operations team', true, '{"location": "Warehouse A"}', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- USERS - Create demo users
-- =====================================================

-- Super Admin User (Full system access)
INSERT INTO users (id, email, "firstName", "lastName", role, "isActive", "teamId", "managerId", "shiftPreferences", "createdAt", "updatedAt")
VALUES 
    ('c0000001-0000-0000-0000-000000000001', 'admin@samay.io', 'Super', 'Admin', 'admin', true, NULL, NULL, '{}', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    "firstName" = 'Super',
    "lastName" = 'Admin',
    "isActive" = true;

-- Manager Users
INSERT INTO users (id, email, "firstName", "lastName", role, "isActive", "teamId", "managerId", "shiftPreferences", "createdAt", "updatedAt")
VALUES 
    ('c0000001-0000-0000-0000-000000000002', 'manager@samay.io', 'Sarah', 'Miller', 'manager', true, 'b0000001-0000-0000-0000-000000000001', NULL, '{"shift_morning": 10}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000003', 'mike.johnson@samay.io', 'Mike', 'Johnson', 'manager', true, 'b0000001-0000-0000-0000-000000000002', NULL, '{"shift_evening": 10}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000004', 'emily.chen@samay.io', 'Emily', 'Chen', 'manager', true, 'b0000001-0000-0000-0000-000000000003', NULL, '{"shift_night": 10}', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role,
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "teamId" = EXCLUDED."teamId",
    "isActive" = true;

-- Associate Users (Team Members)
INSERT INTO users (id, email, "firstName", "lastName", role, "isActive", "teamId", "managerId", "shiftPreferences", "createdAt", "updatedAt")
VALUES 
    -- Morning Crew Associates
    ('c0000001-0000-0000-0000-000000000010', 'associate@samay.io', 'Alex', 'Johnson', 'employee', true, 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', '{"shift_morning": 10, "shift_evening": -5}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000011', 'maria.garcia@samay.io', 'Maria', 'Garcia', 'employee', true, 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', '{"shift_morning": 5}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000012', 'david.lee@samay.io', 'David', 'Lee', 'employee', true, 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', '{"shift_morning": 8}', NOW(), NOW()),
    
    -- Evening Crew Associates
    ('c0000001-0000-0000-0000-000000000013', 'james.wilson@samay.io', 'James', 'Wilson', 'employee', true, 'b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000003', '{"shift_evening": 10}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000014', 'lisa.brown@samay.io', 'Lisa', 'Brown', 'employee', true, 'b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000003', '{"shift_evening": 8}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000015', 'robert.taylor@samay.io', 'Robert', 'Taylor', 'employee', true, 'b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000003', '{"shift_evening": 5}', NOW(), NOW()),
    
    -- Night Shift Associates
    ('c0000001-0000-0000-0000-000000000016', 'jennifer.white@samay.io', 'Jennifer', 'White', 'employee', true, 'b0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000004', '{"shift_night": 10}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000017', 'michael.harris@samay.io', 'Michael', 'Harris', 'employee', true, 'b0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000004', '{"shift_night": 8}', NOW(), NOW()),
    
    -- Unassigned Associates (No team yet)
    ('c0000001-0000-0000-0000-000000000020', 'new.associate1@samay.io', 'New', 'Associate1', 'employee', true, NULL, NULL, '{}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000021', 'new.associate2@samay.io', 'Pending', 'User', 'employee', true, NULL, NULL, '{}', NOW(), NOW()),
    ('c0000001-0000-0000-0000-000000000022', 'new.associate3@samay.io', 'Trainee', 'Worker', 'employee', true, NULL, NULL, '{}', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role,
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "teamId" = EXCLUDED."teamId",
    "managerId" = EXCLUDED."managerId",
    "isActive" = true;

-- =====================================================
-- USER_SKILLS - Assign skills to users
-- =====================================================
INSERT INTO user_skills ("userId", "skillId")
VALUES 
    -- Alex Johnson skills
    ('c0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001'),  -- Forklift
    ('c0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000004'),  -- Customer Service
    ('c0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000006'),  -- Opening
    
    -- Maria Garcia skills
    ('c0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000002'),  -- Cashier
    ('c0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000004'),  -- Customer Service
    
    -- David Lee skills
    ('c0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000003'),  -- Inventory
    ('c0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000001'),  -- Forklift
    
    -- James Wilson skills
    ('c0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000002'),  -- Cashier
    ('c0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000007'),  -- Closing
    
    -- Manager skills (Sarah Miller)
    ('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000005'),  -- Supervisor
    ('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000006'),  -- Opening
    ('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000007')   -- Closing
ON CONFLICT DO NOTHING;

-- =====================================================
-- SHIFTS - Create sample shifts for the current week
-- =====================================================

-- Get current date and create shifts for the week
DO $$
DECLARE
    current_date_val DATE := CURRENT_DATE;
    day_offset INT;
BEGIN
    FOR day_offset IN 0..6 LOOP
        -- Morning shifts (Open)
        INSERT INTO shifts (id, version, "teamId", date, "startTime", "endTime", "startDateTime", "endDateTime", "shiftCode", "durationHours", status, "requiredSkills", notes, metadata, "createdAt", "updatedAt")
        VALUES 
            (uuid_generate_v4(), 1, 'b0000001-0000-0000-0000-000000000001', 
             current_date_val + day_offset, '06:00', '14:00',
             (current_date_val + day_offset)::timestamp + '06:00:00'::time,
             (current_date_val + day_offset)::timestamp + '14:00:00'::time,
             'shift_morning', 8, 'OPEN', '["skill_opening"]', 'Morning opening shift', '{}', NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        -- Evening shifts (Assigned to associates)
        INSERT INTO shifts (id, version, "teamId", date, "startTime", "endTime", "startDateTime", "endDateTime", "shiftCode", "durationHours", status, "requiredSkills", "assignedUserId", "assignedAt", "assignmentSource", notes, metadata, "createdAt", "updatedAt")
        VALUES 
            (uuid_generate_v4(), 1, 'b0000001-0000-0000-0000-000000000002', 
             current_date_val + day_offset, '14:00', '22:00',
             (current_date_val + day_offset)::timestamp + '14:00:00'::time,
             (current_date_val + day_offset)::timestamp + '22:00:00'::time,
             'shift_evening', 8, 'ASSIGNED', '["skill_closing"]', 
             'c0000001-0000-0000-0000-000000000013', NOW(), 'manual',
             'Evening closing shift', '{}', NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Add some confirmed shifts for Alex Johnson
INSERT INTO shifts (id, version, "teamId", date, "startTime", "endTime", "startDateTime", "endDateTime", "shiftCode", "durationHours", status, "requiredSkills", "assignedUserId", "assignedAt", "assignmentSource", notes, metadata, "createdAt", "updatedAt")
VALUES 
    (uuid_generate_v4(), 1, 'b0000001-0000-0000-0000-000000000001', 
     CURRENT_DATE + 1, '09:00', '17:00',
     (CURRENT_DATE + 1)::timestamp + '09:00:00'::time,
     (CURRENT_DATE + 1)::timestamp + '17:00:00'::time,
     'shift_morning', 8, 'CONFIRMED', '["skill_cashier"]', 
     'c0000001-0000-0000-0000-000000000010', NOW(), 'manual',
     'Regular day shift', '{}', NOW(), NOW()),
    (uuid_generate_v4(), 1, 'b0000001-0000-0000-0000-000000000001', 
     CURRENT_DATE + 2, '09:00', '17:00',
     (CURRENT_DATE + 2)::timestamp + '09:00:00'::time,
     (CURRENT_DATE + 2)::timestamp + '17:00:00'::time,
     'shift_morning', 8, 'CONFIRMED', '["skill_cashier"]', 
     'c0000001-0000-0000-0000-000000000010', NOW(), 'manual',
     'Regular day shift', '{}', NOW(), NOW()),
    (uuid_generate_v4(), 1, 'b0000001-0000-0000-0000-000000000001', 
     CURRENT_DATE + 3, '13:00', '21:00',
     (CURRENT_DATE + 3)::timestamp + '13:00:00'::time,
     (CURRENT_DATE + 3)::timestamp + '21:00:00'::time,
     'shift_afternoon', 8, 'CONFIRMED', '["skill_customer_service"]', 
     'c0000001-0000-0000-0000-000000000010', NOW(), 'manual',
     'Afternoon shift', '{}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- AVAILABILITIES - Create sample availability entries
-- =====================================================
INSERT INTO availabilities (id, "userId", "startTime", "endTime", type, notes, recurrence, "createdAt", "updatedAt")
VALUES 
    -- Alex Johnson availability
    (uuid_generate_v4(), 'c0000001-0000-0000-0000-000000000010', 
     (CURRENT_DATE + 1)::timestamp + '09:00:00'::time,
     (CURRENT_DATE + 1)::timestamp + '17:00:00'::time,
     'PREFERRED', 'Preferred morning hours', NULL, NOW(), NOW()),
    (uuid_generate_v4(), 'c0000001-0000-0000-0000-000000000010', 
     (CURRENT_DATE + 1)::timestamp + '17:00:00'::time,
     (CURRENT_DATE + 1)::timestamp + '22:00:00'::time,
     'AVOIDED', 'Prefer not to work evenings', NULL, NOW(), NOW()),
    
    -- Maria Garcia availability
    (uuid_generate_v4(), 'c0000001-0000-0000-0000-000000000011', 
     (CURRENT_DATE + 2)::timestamp + '06:00:00'::time,
     (CURRENT_DATE + 2)::timestamp + '14:00:00'::time,
     'PREFERRED', 'Morning person', NULL, NOW(), NOW()),
    
    -- James Wilson blackout
    (uuid_generate_v4(), 'c0000001-0000-0000-0000-000000000013', 
     (CURRENT_DATE + 5)::timestamp + '00:00:00'::time,
     (CURRENT_DATE + 5)::timestamp + '23:59:59'::time,
     'BLACKOUT', 'Personal day off', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- Summary
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Samay Demo Data Seed Complete!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Demo Accounts Created:';
    RAISE NOTICE '';
    RAISE NOTICE '  SUPER ADMIN:';
    RAISE NOTICE '    Email: admin@samay.io';
    RAISE NOTICE '    Password: admin123';
    RAISE NOTICE '';
    RAISE NOTICE '  MANAGER:';
    RAISE NOTICE '    Email: manager@samay.io';
    RAISE NOTICE '    Password: manager123';
    RAISE NOTICE '';
    RAISE NOTICE '  ASSOCIATE:';
    RAISE NOTICE '    Email: associate@samay.io';
    RAISE NOTICE '    Password: associate123';
    RAISE NOTICE '';
    RAISE NOTICE 'Additional users have been created.';
    RAISE NOTICE 'See documentation for full list.';
    RAISE NOTICE '==========================================';
END $$;

