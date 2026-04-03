-- Add NetCAD Coordinator Account
-- Email: netcad@kompi.com
-- Password: NetCAD@123
-- Role: Coordinator (role_id = 4)

INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at, updated_at, email_verified)
VALUES (
  UUID(),
  'NetCAD Coordinator',
  'netcad@kompi.com',
  '$2b$10$plwQGzBTcTNI40DfCZma3Ov.LilAaZ9/0nhYzrpQbDDrvPzfxj8gy',
  4,
  1,
  NOW(),
  NOW(),
  1
);
