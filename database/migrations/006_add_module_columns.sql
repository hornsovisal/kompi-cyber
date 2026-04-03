-- ============================================================
-- Migration: Add missing columns to modules table
-- Date: 2026-04-03
-- Description: Add description, created_at, and updated_at columns to modules table
-- ============================================================

-- Add new columns to modules table
ALTER TABLE `modules` 
ADD COLUMN `description` TEXT AFTER `title`,
ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `module_order`,
ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Create index for efficiency
CREATE INDEX `idx_modules_course_order` ON `modules` (`course_id`, `module_order`);
CREATE INDEX `idx_modules_created_at` ON `modules` (`created_at`);

-- Note: All existing modules will have current timestamp for created_at and updated_at
