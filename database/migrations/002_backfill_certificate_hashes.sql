-- ============================================================
-- Migration: Backfill certificate_hash for existing certificates
-- Description: Generate SHA256 hashes for certificates that don't have one
-- ============================================================

-- This SQL will generate hashes for all certificates where certificate_hash is NULL
-- MySQL 8.0+ supports SHA2 function
UPDATE certificates 
SET certificate_hash = SUBSTRING(SHA2(certificate_code, 256), 1, 16)
WHERE certificate_hash IS NULL;

-- Verify the update
SELECT id, certificate_code, certificate_hash FROM certificates WHERE certificate_hash IS NOT NULL;
