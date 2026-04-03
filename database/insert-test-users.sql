-- ============================================================
-- Create Test User Accounts for KOMPI-CYBER Platform
-- Roles: 2=Teacher/Instructor, 3=Admin, 4=Coordinator
-- ============================================================

-- Teacher 1
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at)
VALUES (
  UUID(),
  'John Teacher',
  'john@teacher.com',
  '$2b$10$JdAQxVyBRNdQ6HiB.l5ZJ.WxHDG6NVBcR9JTUoy4FXfWfRHAf4Gqi', -- Password: Teacher@123
  2,
  1,
  NOW()
);

-- Teacher 2
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at)
VALUES (
  UUID(),
  'Sarah Teacher',
  'sarah@teacher.com',
  '$2b$10$cUsDQfROC8LEtFAkmY2pwe7iNJC9DG91ClxTswdyPxL5T7LpDxTXm', -- Password: Teacher@456
  2,
  1,
  NOW()
);

-- Coordinator
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at)
VALUES (
  UUID(),
  'Mike Coordinator',
  'mike@coordinator.com',
  '$2b$10$OiyjnDJdz/CQAo4KEbDOJ.DWTCziwgeOU8Rl5aPjHYbjcLFyeCBAa', -- Password: Coordinator@789
  4,
  1,
  NOW()
);

-- Admin
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at)
VALUES (
  UUID(),
  'Admin User',
  'admin@kompi.com',
  '$2b$10$m0jeXZ4vpmxvZDClAItHVej3aGPIpIR5V3nYccmgeYtnw.kZVNkta', -- Password: Admin@2026
  3,
  1,
  NOW()
);

-- ============================================================
-- Login Credentials
-- ============================================================
-- Teacher 1:       john@teacher.com      /  Teacher@123
-- Teacher 2:       sarah@teacher.com     /  Teacher@456
-- Coordinator:     mike@coordinator.com  /  Coordinator@789
-- Admin:           admin@kompi.com       /  Admin@2026
-- ============================================================

SELECT 'Test accounts created successfully!' as status;
SELECT full_name, email, 'Teacher' as role FROM users WHERE role_id = 2 UNION ALL
SELECT full_name, email, 'Coordinator' as role FROM users WHERE role_id = 4 UNION ALL
SELECT full_name, email, 'Admin' as role FROM users WHERE role_id = 3;
