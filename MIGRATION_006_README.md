# Database Migration: Add Module Columns

## Issue
The `modules` table was missing three columns that the module management feature needs:
- `description` (TEXT) - Module description
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp

## Solution
Apply the migration file: `database/migrations/006_add_module_columns.sql`

## How to Apply

### Option 1: Using Railway CLI (Recommended)
```bash
# Login to Railway
railway login

# Navigate to project
railway link

# Run the migration using mysql
mysql -h mysql-336d1fca-kompi-cyber.e.aivencloud.com \
  -P 19044 \
  -u avnadmin \
  -p[PASSWORD] \
  kompicyber < database/migrations/006_add_module_columns.sql
```

### Option 2: Using Node.js Script
```bash
cd backend
npm install  # if not already installed
node scripts/apply-migration-006.js
```
(Requires DB_HOST, DB_USER, DB_PASSWORD, DB_NAME environment variables)

### Option 3: Direct SQL Execution
Run the following SQL commands in your database client:

```sql
ALTER TABLE `modules` 
ADD COLUMN `description` TEXT AFTER `title`,
ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `module_order`,
ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

CREATE INDEX `idx_modules_course_order` ON `modules` (`course_id`, `module_order`);
CREATE INDEX `idx_modules_created_at` ON `modules` (`created_at`);
```

## Verification
After applying the migration, verify by running:
```sql
DESCRIBE modules;
```

You should see columns: `id`, `course_id`, `title`, `description`, `module_order`, `created_at`, `updated_at`

## Impact
- ✅ Existing modules will automatically get current timestamp for `created_at` and `updated_at`
- ✅ Module API will now work correctly
- ✅ Course detail page will be able to fetch modules
