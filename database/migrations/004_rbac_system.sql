-- ============================================================
-- 004_rbac_system.sql
-- Supabase migration for the RBAC Instructor Dashboard system
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Courses Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rbac_courses (
  id          TEXT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  created_by  VARCHAR(50)  NOT NULL,           -- coordinator employeeId
  instructors TEXT[]       DEFAULT '{}',       -- array of instructor employeeIds
  students    TEXT[]       DEFAULT '{}',       -- array of student ids
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Students Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rbac_students (
  id               TEXT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  enrolled_courses TEXT[]       DEFAULT '{}',
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Quizzes Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rbac_quizzes (
  id         TEXT PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  course_id  TEXT         NOT NULL REFERENCES rbac_courses(id) ON DELETE CASCADE,
  due_date   DATE,
  due_time   TIME,
  status     VARCHAR(20)  DEFAULT 'closed' CHECK (status IN ('open', 'closed')),
  created_by VARCHAR(50)  NOT NULL,           -- instructor employeeId
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_rbac_courses_created_by   ON rbac_courses(created_by);
CREATE INDEX IF NOT EXISTS idx_rbac_quizzes_course_id    ON rbac_quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_rbac_quizzes_created_by   ON rbac_quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_rbac_students_email       ON rbac_students(email);

-- ── RLS Policies (optional — enable if you use Supabase Auth) ─
-- ALTER TABLE rbac_courses  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rbac_quizzes  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rbac_students ENABLE ROW LEVEL SECURITY;

-- ── Seed Data (optional — matches in-memory defaults) ────────
INSERT INTO rbac_courses (id, title, description, created_by, instructors, students)
VALUES
  ('course-001', 'Introduction to Cybersecurity',    'Covers fundamental cybersecurity concepts.',  'COORD001', ARRAY['LEC005'], ARRAY[]::TEXT[]),
  ('course-002', 'Network Security Fundamentals',     'Deep dive into network protocols.',           'COORD001', ARRAY['LEC001'], ARRAY[]::TEXT[]),
  ('course-003', 'Web Application Security',          'OWASP Top 10 and secure coding practices.',  'COORD002', ARRAY['LEC002'], ARRAY[]::TEXT[]),
  ('course-004', 'Incident Response & Forensics',     'Incident handling lifecycle.',                'COORD002', ARRAY['LEC003'], ARRAY[]::TEXT[]),
  ('course-005', 'Linux for Security Professionals',  'Linux CLI and hardening techniques.',         'COORD001', ARRAY['LEC004'], ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO rbac_quizzes (id, title, course_id, due_date, due_time, status, created_by)
VALUES
  ('quiz-001', 'CIA Triad Concepts',       'course-001', '2026-04-10', '23:59', 'open',   'LEC005'),
  ('quiz-002', 'Network Protocols Quiz',    'course-002', '2026-04-15', '18:00', 'closed', 'LEC001'),
  ('quiz-003', 'OWASP Top 10 Assessment',  'course-003', '2026-04-20', '20:00', 'open',   'LEC002')
ON CONFLICT (id) DO NOTHING;
