-- Add missing modules and content for courses without them

-- Check for Course 5: Incident Response & Forensics (no modules)
INSERT INTO modules (course_id, title, module_order) 
SELECT 5, 'Module 1: Incident Response Fundamentals', 1
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE course_id = 5);

-- Get the module ID we just created (or already exists)
SET @module_id = (SELECT id FROM modules WHERE course_id = 5 AND module_order = 1 LIMIT 1);

-- Add lesson to module (if not exists)
INSERT INTO lessons (module_id, title, content_md, lesson_order)
SELECT @module_id, 'Getting Started with Incident Response', 
'# Getting Started with Incident Response\n\n## Overview\nWelcome to Incident Response & Forensics! This introductory lesson covers the fundamentals of handling security incidents and performing digital forensics.\n\n## Learning Objectives\n- Understand incident response frameworks\n- Learn the fundamentals of forensic analysis\n- Prepare for advanced incident handling\n\n## Content\nComplete the quiz below to test your understanding.', 1
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id);

-- Get the lesson ID we just created
SET @lesson_id = (SELECT id FROM lessons WHERE module_id = @module_id AND lesson_order = 1 LIMIT 1);

-- Add quiz question (if not exists)
INSERT INTO quiz_questions (lesson_id, question_text, question_order)
SELECT @lesson_id, 'What is the primary goal of incident response?', 1
WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE lesson_id = @lesson_id);

-- Get the question ID
SET @question_id = (SELECT id FROM quiz_questions WHERE lesson_id = @lesson_id LIMIT 1);

-- Add quiz options (only if no options exist yet)
INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @question_id, 'To detect, contain, and remediate security incidents as quickly as possible', 1
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @question_id AND option_text LIKE '%detect%')
UNION ALL
SELECT @question_id, 'To blame the affected user for the security breach', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @question_id AND option_text LIKE '%blame%')
UNION ALL
SELECT @question_id, 'To ignore the incident and hope it goes away', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @question_id AND option_text LIKE '%ignore%')
UNION ALL
SELECT @question_id, 'To penalize the security team', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @question_id AND option_text LIKE '%penalize%');
