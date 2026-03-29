-- Migration: Add course_type field to courses
-- Differentiates between 'online-led' (self-paced) and 'instructor-led' courses

ALTER TABLE `courses`
ADD COLUMN `course_type` ENUM('online-led', 'instructor-led') 
NOT NULL DEFAULT 'online-led' 
AFTER `duration_hrs`;

-- Add index for filtering courses by type
CREATE INDEX `idx_courses_type` ON `courses` (`course_type`);

-- Add comment to document the field
ALTER TABLE `courses` 
MODIFY COLUMN `course_type` ENUM('online-led', 'instructor-led') 
NOT NULL DEFAULT 'online-led' 
COMMENT 'online-led: self-paced learning, instructor-led: requires teacher invitation';
