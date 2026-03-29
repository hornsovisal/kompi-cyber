-- Set all courses to self-paced (online-led)
-- Run this to initialize all existing courses as self-paced
-- User will manually change specific courses to instructor-led or hybrid later

UPDATE `courses`
SET `course_type` = 'online-led'
WHERE `course_type` IS NULL OR `course_type` = '';

-- Verify the update
SELECT id, title, course_type FROM `courses` LIMIT 10;
