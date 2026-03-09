-- ============================================================
-- Seed data for CyberNext schema
-- Run this after database/schema.sql
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear child tables first
DELETE FROM quiz_answers;
DELETE FROM quiz_attempts;
DELETE FROM quiz_options;
DELETE FROM quiz_questions;
DELETE FROM exercise_submissions;
DELETE FROM exercise_test_cases;
DELETE FROM exercises;
DELETE FROM lesson_progress;
DELETE FROM lessons;
DELETE FROM modules;
DELETE FROM enrollments;
DELETE FROM certificates;
DELETE FROM courses;
DELETE FROM domains;
DELETE FROM users;
DELETE FROM roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1) roles
-- ------------------------------------------------------------
INSERT INTO roles (id, name) VALUES
	(1, 'student'),
	(2, 'instructor'),
	(3, 'admin');

-- ------------------------------------------------------------
-- 2) users
-- password_hash below is a sample bcrypt hash for demo only.
-- ------------------------------------------------------------
SET @admin_user_id      = UUID();
SET @instructor_user_id = UUID();
SET @nimal_user_id      = UUID();
SET @kavya_user_id      = UUID();

INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) VALUES
	(@admin_user_id,      'Admin User',       'admin@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 3, 1),
	(@instructor_user_id, 'Aisha Instructor', 'aisha@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 2, 1),
	(@nimal_user_id,      'Nimal Student',    'nimal@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 1, 1),
	(@kavya_user_id,      'Kavya Student',    'kavya@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 1, 1);

-- ------------------------------------------------------------
-- 3) domains
-- ------------------------------------------------------------
INSERT INTO domains (id, name, description) VALUES
	(1, 'Cybersecurity Fundamentals', 'Core security concepts for beginners.'),
	(2, 'Ethical Hacking',            'Offensive security basics and safe lab practice.');

-- ------------------------------------------------------------
-- 4) courses
-- ------------------------------------------------------------
INSERT INTO courses (id, domain_id, title, description, level, duration_hrs, is_published, created_by) VALUES
	(1, 1, 'Introduction to Cybersecurity', 'Starter course on threats, CIA triad, and cyber hygiene.', 'beginner', 12, 1, @instructor_user_id),
	(2, 2, 'Ethical Hacking Essentials',    'Introductory ethical hacking methodology and tooling.',      'intermediate', 20, 1, @instructor_user_id);

-- ------------------------------------------------------------
-- 5) enrollments
-- ------------------------------------------------------------
INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES
	(1, @nimal_user_id, 1, '2026-03-01 09:00:00'),
	(2, @kavya_user_id, 1, '2026-03-01 09:30:00'),
	(3, @nimal_user_id, 2, '2026-03-02 10:00:00');

-- ------------------------------------------------------------
-- 6) modules
-- ------------------------------------------------------------
INSERT INTO modules (id, course_id, title, module_order) VALUES
	(1, 1, 'Foundations of Security', 1),
	(2, 1, 'Safe Digital Behavior',   2),
	(3, 2, 'Reconnaissance Basics',   1);

-- ------------------------------------------------------------
-- 7) lessons
-- ------------------------------------------------------------
INSERT INTO lessons (id, module_id, title, content_md, lesson_order) VALUES
	(1, 1, 'Introduction to Cybersecurity',               'upload/lesson/intro-to-cyber-course/module-1-introduction-to-cybersecurity.md',                         1),
	(2, 1, 'Common Cyber Threats',                        'upload/lesson/intro-to-cyber-course/module-2-common-cyber-threats.md',                                   2),
	(3, 2, 'CIA Triad and Core Security Principles',      'upload/lesson/intro-to-cyber-course/module-3-cia-triad-and-core-security-principles.md',                1),
	(4, 2, 'Passwords, Authentication, and Access Control','upload/lesson/intro-to-cyber-course/module-4-passwords-authentication-and-access-control.md',            2),
	(5, 3, 'Safe Browsing, Email, and Cyber Hygiene',     'upload/lesson/intro-to-cyber-course/module-5-safe-browsing-email-and-cyber-hygiene.md',                 1);

-- ------------------------------------------------------------
-- 8) lesson_progress
-- ------------------------------------------------------------
INSERT INTO lesson_progress (id, user_id, lesson_id, status, completed_at) VALUES
	(1, @nimal_user_id, 1, 'completed',  '2026-03-03 08:00:00'),
	(2, @nimal_user_id, 2, 'in_progress', NULL),
	(3, @kavya_user_id, 1, 'completed',  '2026-03-03 10:00:00'),
	(4, @kavya_user_id, 3, 'not_started', NULL);

-- ------------------------------------------------------------
-- 9) quiz_questions
-- ------------------------------------------------------------
INSERT INTO quiz_questions (id, lesson_id, question_text, question_order) VALUES
	(1, 1, 'Which of the following best defines cybersecurity?', 1),
	(2, 2, 'In the CIA triad, which pillar ensures data is accurate and unaltered?', 1),
	(3, 4, 'Which sign most strongly indicates a phishing email?', 1);

-- ------------------------------------------------------------
-- 10) quiz_options
-- ------------------------------------------------------------
INSERT INTO quiz_options (id, question_id, option_text, is_correct) VALUES
	(1, 1, 'Protecting digital systems and data from unauthorized access and attacks', 1),
	(2, 1, 'Only installing antivirus software', 0),
	(3, 1, 'Creating social media accounts securely', 0),
	(4, 1, 'Turning off all internet connections', 0),

	(5, 2, 'Availability', 0),
	(6, 2, 'Integrity', 1),
	(7, 2, 'Confidentiality', 0),
	(8, 2, 'Authentication', 0),

	(9,  3, 'Unexpected urgent request with suspicious link', 1),
	(10, 3, 'A scheduled weekly newsletter', 0),
	(11, 3, 'Email from your own verified domain', 0),
	(12, 3, 'Meeting invite from your team calendar', 0);

-- ------------------------------------------------------------
-- 11) quiz_attempts
-- ------------------------------------------------------------
INSERT INTO quiz_attempts (id, user_id, lesson_id, attempt_no, score, passed, submitted_at) VALUES
	(1, @nimal_user_id, 1, 1, 100, 1, '2026-03-03 08:10:00'),
	(2, @nimal_user_id, 2, 1,  50, 0, '2026-03-03 08:20:00'),
	(3, @nimal_user_id, 2, 2, 100, 1, '2026-03-03 08:35:00'),
	(4, @kavya_user_id, 1, 1, 100, 1, '2026-03-03 10:10:00');

-- ------------------------------------------------------------
-- 12) quiz_answers
-- ------------------------------------------------------------
INSERT INTO quiz_answers (id, attempt_id, question_id, selected_option_id, is_correct) VALUES
	(1, 1, 1, 1, 1),
	(2, 2, 2, 5, 0),
	(3, 3, 2, 6, 1),
	(4, 4, 1, 1, 1);

-- ------------------------------------------------------------
-- 13) exercises
-- ------------------------------------------------------------
INSERT INTO exercises (id, lesson_id, title, instructions_md, starter_code, language, time_limit_ms, memory_limit_mb) VALUES
	(1, 3, 'Password Strength Checker',
	 'Write a Python function that classifies a password as weak/medium/strong.',
	 'def classify_password(pw: str) -> str:\n    # TODO\n    return "weak"\n',
	 'python', 5000, 128),

	(2, 5, 'Basic Port Scan Parser',
	 'Parse scan output and return only open ports as integers in ascending order.',
	 'def open_ports(scan_output: str) -> list[int]:\n    # TODO\n    return []\n',
	 'python', 7000, 128);

-- ------------------------------------------------------------
-- 14) exercise_test_cases
-- ------------------------------------------------------------
INSERT INTO exercise_test_cases (id, exercise_id, input, expected_output, is_hidden) VALUES
	(1, 1, 'P@ssw0rd123!', 'strong', 0),
	(2, 1, 'abc123',       'weak',   1),
	(3, 2, '22/open\n80/closed\n443/open', '[22,443]', 0),
	(4, 2, '21/open\n25/open\n110/closed', '[21,25]', 1);

-- ------------------------------------------------------------
-- 15) exercise_submissions
-- ------------------------------------------------------------
INSERT INTO exercise_submissions (id, exercise_id, user_id, code, stdout, stderr, execution_time_ms, memory_used_mb, passed, score, submitted_at) VALUES
	(1, 1, @nimal_user_id,
	 'def classify_password(pw):\n    return "strong" if len(pw) >= 12 else "weak"',
	 'strong', '', 19, 12, 1, 100, '2026-03-03 09:00:00'),

	(2, 2, @nimal_user_id,
	 'def open_ports(scan_output):\n    return [22,443]',
	 '[22,443]', '', 23, 14, 1, 100, '2026-03-04 09:30:00'),

	(3, 1, @kavya_user_id,
	 'def classify_password(pw):\n    return "weak"',
	 'weak', '', 11, 10, 0, 30, '2026-03-04 11:00:00');

-- ------------------------------------------------------------
-- 16) certificates
-- ------------------------------------------------------------
INSERT INTO certificates (id, user_id, course_id, certificate_code, issued_at, pdf_path) VALUES
	(1, @nimal_user_id, 1, 'CYBER-2026-A1B2', '2026-03-05 12:00:00', '/certs/CYBER-2026-A1B2.pdf');

COMMIT;
