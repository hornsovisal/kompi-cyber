-- Add course_type column to courses table
-- Supports: 'online-led', 'instructor-led', 'both' (hybrid)

ALTER TABLE `courses` 
ADD COLUMN `course_type` ENUM('online-led', 'instructor-led', 'both') 
NOT NULL DEFAULT 'online-led' 
AFTER `duration_hrs`;
