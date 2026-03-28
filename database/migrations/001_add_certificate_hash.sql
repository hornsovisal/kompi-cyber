-- ============================================================
-- Migration: Add certificate_hash column to certificates table
-- Date: 2024
-- Description: Add cryptographic hash column for secure certificate URLs
-- ============================================================

-- Add the certificate_hash column
ALTER TABLE `certificates` 
ADD COLUMN `certificate_hash` CHAR(16) UNIQUE AFTER `certificate_code`;

-- Create index on certificate_hash for faster lookups
CREATE INDEX `idx_certificates_hash` ON `certificates` (`certificate_hash`);

-- Note: To backfill existing certificates with hashes, run:
-- UPDATE certificates SET certificate_hash = SUBSTRING(SHA2(certificate_code, 256), 1, 16) WHERE certificate_hash IS NULL;
