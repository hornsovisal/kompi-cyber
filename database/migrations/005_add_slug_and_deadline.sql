-- Add deadline and slug support for quiz features
-- Enables deadline checking and slug-based ID routing

-- Add deadline to quiz_attempts (when quiz can no longer be submitted)
ALTER TABLE `quiz_attempts`
ADD COLUMN `deadline` DATETIME NULL DEFAULT NULL AFTER `submitted_at`,
ADD COLUMN `status` ENUM('in_progress','submitted','expired') DEFAULT 'in_progress' AFTER `deadline`;

-- Add deadlines to lessons for quiz submission control
ALTER TABLE `lessons`
ADD COLUMN `quiz_deadline` DATETIME NULL DEFAULT NULL AFTER `updated_at`,
ADD COLUMN `slug` VARCHAR(64) UNIQUE AFTER `content_md`;

-- Add slug to courses
ALTER TABLE `courses`
ADD COLUMN `slug` VARCHAR(64) UNIQUE AFTER `updated_at`;

-- Add slug to modules
ALTER TABLE `modules`
ADD COLUMN `slug` VARCHAR(64) UNIQUE AFTER `course_id`;

-- Add slug to quiz_questions
ALTER TABLE `quiz_questions`
ADD COLUMN `slug` VARCHAR(64) UNIQUE AFTER `question_order`;

-- Add slug to exercises
ALTER TABLE `exercises`
ADD COLUMN `slug` VARCHAR(64) UNIQUE AFTER `time_limit_ms`;

-- Create indexes for slug lookups
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_quiz_questions_slug ON quiz_questions(slug);
CREATE INDEX idx_exercises_slug ON exercises(slug);
