-- ============================================================
--  CyberNext  —  Cybersecurity Course Platform
--  MySQL 8.0+  |  utf8mb4_unicode_ci
--
--  Structure (mirrors Cisco NetAcad):
--    Domain → Course → Module → Lesson → Quiz / Exercise
--
--  Roles:     student | instructor | admin
--  Domains:   top-level subject areas  (Network Security, Ethical Hacking …)
--  Courses:   full self-contained curriculum inside a domain
--  Modules:   ordered chapters inside a course
--  Lessons:   ordered content pages inside a module
--  Quizzes:   per-lesson knowledge checks  (retakeable)
--  Exercises: per-lesson scripting / coding challenges
--  Certs:     awarded on full course completion
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. roles
-- ------------------------------------------------------------
CREATE TABLE `roles` (
  `id`   INT         NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`name`) VALUES ('student'), ('instructor'), ('admin');

-- ------------------------------------------------------------
-- 2. users
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id`            CHAR(36)     NOT NULL,        -- UUID v4
  `full_name`     VARCHAR(120) NOT NULL,
  `email`         VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id`       INT          NOT NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role_id` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. domains
--    Top-level cybersecurity subject areas.
--    e.g. "Network Security", "Ethical Hacking", "Digital Forensics"
-- ------------------------------------------------------------
CREATE TABLE `domains` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `description` TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_domains_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. courses
--    One course = one self-contained curriculum.
--    e.g. "Introduction to Cybersecurity", "Ethical Hacking Essentials"
-- ------------------------------------------------------------
CREATE TABLE `courses` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `domain_id`    INT          NOT NULL,
  `title`        VARCHAR(200) NOT NULL,
  `description`  TEXT,
  `level`        ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `duration_hrs` SMALLINT     NOT NULL DEFAULT 0,    -- estimated study hours
  `is_published` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_by`   CHAR(36)     NOT NULL,              -- instructor user
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courses_domain_id`  (`domain_id`),
  KEY `idx_courses_created_by` (`created_by`),
  CONSTRAINT `fk_courses_domain`     FOREIGN KEY (`domain_id`)  REFERENCES `domains` (`id`),
  CONSTRAINT `fk_courses_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. enrollments
--    A student registers for a course.
-- ------------------------------------------------------------
CREATE TABLE `enrollments` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `user_id`     CHAR(36)  NOT NULL,
  `course_id`   INT       NOT NULL,
  `enrolled_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollments_user_course` (`user_id`, `course_id`),
  KEY `idx_enrollments_course_id` (`course_id`),
  CONSTRAINT `fk_enrollments_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`   (`id`),
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. modules
--    Ordered chapters within a course.
--    e.g. Course "Ethical Hacking" → Module 1 "Reconnaissance"
-- ------------------------------------------------------------
CREATE TABLE `modules` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `course_id`    INT          NOT NULL,
  `title`        VARCHAR(200) NOT NULL,
  `module_order` TINYINT      NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_modules_course_order` (`course_id`, `module_order`),
  CONSTRAINT `fk_modules_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. lessons
--    Ordered content pages within a module.
--    content_md holds the lesson body (text, embeds, code blocks).
-- ------------------------------------------------------------
CREATE TABLE `lessons` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `module_id`     INT          NOT NULL,
  `title`         VARCHAR(200) NOT NULL,
  `content_md`    MEDIUMTEXT,
  `lesson_order`  TINYINT      NOT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lessons_module_order` (`module_id`, `lesson_order`),
  CONSTRAINT `fk_lessons_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. lesson_progress
--    Tracks a student's completion state per lesson.
-- ------------------------------------------------------------
CREATE TABLE `lesson_progress` (
  `id`           INT       NOT NULL AUTO_INCREMENT,
  `user_id`      CHAR(36)  NOT NULL,
  `lesson_id`    INT       NOT NULL,
  `status`       ENUM('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lesson_progress_user_lesson` (`user_id`, `lesson_id`),
  KEY `idx_lesson_progress_lesson_id` (`lesson_id`),
  CONSTRAINT `fk_lesson_progress_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`   (`id`),
  CONSTRAINT `fk_lesson_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. quiz_questions
--    Multiple-choice questions attached to a lesson.
-- ------------------------------------------------------------
CREATE TABLE `quiz_questions` (
  `id`             INT     NOT NULL AUTO_INCREMENT,
  `lesson_id`      INT     NOT NULL,
  `question_text`  TEXT    NOT NULL,
  `question_order` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_questions_lesson_id` (`lesson_id`),
  CONSTRAINT `fk_quiz_questions_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. quiz_options
--     Answer choices for each question (one marked correct).
-- ------------------------------------------------------------
CREATE TABLE `quiz_options` (
  `id`          INT        NOT NULL AUTO_INCREMENT,
  `question_id` INT        NOT NULL,
  `option_text` TEXT       NOT NULL,
  `is_correct`  TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_options_question_id` (`question_id`),
  CONSTRAINT `fk_quiz_options_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. quiz_attempts
--     One row per student attempt on a lesson's quiz.
--     Students can retake — attempt_no increments each time.
--     score: percentage 0–100.
-- ------------------------------------------------------------
CREATE TABLE `quiz_attempts` (
  `id`           INT        NOT NULL AUTO_INCREMENT,
  `user_id`      CHAR(36)   NOT NULL,
  `lesson_id`    INT        NOT NULL,
  `attempt_no`   TINYINT    NOT NULL DEFAULT 1,
  `score`        TINYINT    NOT NULL DEFAULT 0,
  `passed`       TINYINT(1) NOT NULL DEFAULT 0,
  `submitted_at` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_attempts_user_lesson` (`user_id`, `lesson_id`),
  KEY `idx_quiz_attempts_lesson_id`   (`lesson_id`),
  CONSTRAINT `fk_quiz_attempts_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`   (`id`),
  CONSTRAINT `fk_quiz_attempts_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. quiz_answers
--     The option a student selected per question in an attempt.
-- ------------------------------------------------------------
CREATE TABLE `quiz_answers` (
  `id`                 INT        NOT NULL AUTO_INCREMENT,
  `attempt_id`         INT        NOT NULL,
  `question_id`        INT        NOT NULL,
  `selected_option_id` INT        NOT NULL,
  `is_correct`         TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_answers_attempt_id`  (`attempt_id`),
  KEY `idx_quiz_answers_question_id` (`question_id`),
  CONSTRAINT `fk_quiz_answers_attempt`  FOREIGN KEY (`attempt_id`)         REFERENCES `quiz_attempts`  (`id`),
  CONSTRAINT `fk_quiz_answers_question` FOREIGN KEY (`question_id`)        REFERENCES `quiz_questions` (`id`),
  CONSTRAINT `fk_quiz_answers_option`   FOREIGN KEY (`selected_option_id`) REFERENCES `quiz_options`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. exercises
--     Scripting / coding challenges attached to a lesson.
--     e.g. "Write a Python port scanner", "Decode this payload"
--     language: free text — python | bash | sql | javascript …
-- ------------------------------------------------------------
CREATE TABLE `exercises` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `lesson_id`       INT          NOT NULL,
  `title`           VARCHAR(200) NOT NULL,
  `instructions_md` TEXT,
  `starter_code`    TEXT,
  `language`        VARCHAR(30)  NOT NULL DEFAULT 'python',
  `time_limit_ms`   INT          NOT NULL DEFAULT 10000,
  `memory_limit_mb` SMALLINT     NOT NULL DEFAULT 128,
  `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exercises_lesson_id` (`lesson_id`),
  CONSTRAINT `fk_exercises_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. exercise_test_cases
--     Auto-graded input/expected-output pairs per exercise.
--     is_hidden = 1 means graded silently (student can't see it).
-- ------------------------------------------------------------
CREATE TABLE `exercise_test_cases` (
  `id`              INT        NOT NULL AUTO_INCREMENT,
  `exercise_id`     INT        NOT NULL,
  `input`           TEXT,
  `expected_output` TEXT       NOT NULL,
  `is_hidden`       TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_test_cases_exercise_id` (`exercise_id`),
  CONSTRAINT `fk_test_cases_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. exercise_submissions
--     Every code run a student submits for an exercise.
--     score: percentage 0–100 based on test cases passed.
-- ------------------------------------------------------------
CREATE TABLE `exercise_submissions` (
  `id`                INT        NOT NULL AUTO_INCREMENT,
  `exercise_id`       INT        NOT NULL,
  `user_id`           CHAR(36)   NOT NULL,
  `code`              TEXT       NOT NULL,
  `stdout`            TEXT,
  `stderr`            TEXT,
  `execution_time_ms` INT,
  `memory_used_mb`    SMALLINT,
  `passed`            TINYINT(1) NOT NULL DEFAULT 0,
  `score`             TINYINT    NOT NULL DEFAULT 0,
  `submitted_at`      TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ex_sub_user_id`      (`user_id`),
  KEY `idx_ex_sub_exercise_id`  (`exercise_id`),
  KEY `idx_ex_sub_submitted_at` (`submitted_at`),
  CONSTRAINT `fk_ex_sub_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`),
  CONSTRAINT `fk_ex_sub_user`     FOREIGN KEY (`user_id`)     REFERENCES `users`     (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 16. certificates
--     Issued once a student completes all modules in a course.
--     certificate_code: short human-readable code e.g. CYBER-2025-A3F9
-- ------------------------------------------------------------
CREATE TABLE `certificates` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `user_id`          CHAR(36)     NOT NULL,
  `course_id`        INT          NOT NULL,
  `certificate_code` CHAR(20)     NOT NULL,
  `issued_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pdf_path`         VARCHAR(500),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_certificates_code`        (`certificate_code`),
  UNIQUE KEY `uq_certificates_user_course` (`user_id`, `course_id`),
  KEY `idx_certificates_course_id` (`course_id`),
  CONSTRAINT `fk_certificates_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`   (`id`),
  CONSTRAINT `fk_certificates_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

