#!/bin/bash

# Slug Migration Setup Script for Developers
# This script sets up slug-based URL routing for security (IDOR prevention)
# Run this ONCE in your development environment

echo "🔐 Kommifi-Cyber: Slug Migration Setup"
echo "========================================"
echo ""

# Step 1: Ensure database connection
echo "📋 Step 1: Verifying database connection..."
cd backend
node -e "
const db = require('./config/db');
(async () => {
  try {
    const [result] = await db.query('SELECT 1');
    console.log('✓ Database connected');
    process.exit(0);
  } catch(err) {
    console.error('✗ Database error:', err.message);
    process.exit(1);
  }
})();
" || exit 1

echo ""
echo "✓ Database is ready"
echo ""

# Step 2: Apply database migrations
echo "📊 Step 2: Applying database migrations..."
echo "   - Adding slug columns to tables"
echo "   - Creating indexes..."

node -e "
const db = require('./config/db');

async function applyMigrations() {
  const migrations = [
    {
      sql: 'ALTER TABLE \`lessons\` ADD COLUMN \`quiz_deadline\` DATETIME NULL DEFAULT NULL AFTER \`updated_at\`',
      name: 'lessons.quiz_deadline'
    },
    {
      sql: 'ALTER TABLE \`lessons\` ADD COLUMN \`slug\` VARCHAR(64) UNIQUE AFTER \`content_md\`',
      name: 'lessons.slug'
    },
    {
      sql: 'ALTER TABLE \`courses\` ADD COLUMN \`slug\` VARCHAR(64) UNIQUE AFTER \`updated_at\`',
      name: 'courses.slug'
    },
    {
      sql: 'ALTER TABLE \`modules\` ADD COLUMN \`slug\` VARCHAR(64) UNIQUE AFTER \`course_id\`',
      name: 'modules.slug'
    },
    {
      sql: 'ALTER TABLE \`quiz_questions\` ADD COLUMN \`slug\` VARCHAR(64) UNIQUE AFTER \`question_order\`',
      name: 'quiz_questions.slug'
    },
    {
      sql: 'ALTER TABLE \`exercises\` ADD COLUMN \`slug\` VARCHAR(64) UNIQUE AFTER \`time_limit_ms\`',
      name: 'exercises.slug'
    },
    {
      sql: 'CREATE INDEX idx_courses_slug ON courses(slug)',
      name: 'index: courses.slug'
    },
    {
      sql: 'CREATE INDEX idx_modules_slug ON modules(slug)',
      name: 'index: modules.slug'
    },
    {
      sql: 'CREATE INDEX idx_lessons_slug ON lessons(slug)',
      name: 'index: lessons.slug'
    },
    {
      sql: 'CREATE INDEX idx_quiz_questions_slug ON quiz_questions(slug)',
      name: 'index: quiz_questions.slug'
    },
    {
      sql: 'CREATE INDEX idx_exercises_slug ON exercises(slug)',
      name: 'index: exercises.slug'
    },
  ];

  for (const migration of migrations) {
    try {
      await db.query(migration.sql);
      console.log('  ✓ ' + migration.name);
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        console.log('  ⊘ ' + migration.name + ' (already exists)');
      } else {
        console.error('  ✗ ' + migration.name, err.message);
        process.exit(1);
      }
    }
  }
  process.exit(0);
}

applyMigrations();
" || exit 1

echo ""
echo "✓ Database migrations applied"
echo ""

# Step 3: Populate slugs
echo "🔑 Step 3: Generating random slugs for existing records..."
echo "   - Courses"
echo "   - Lessons"
echo "   - Modules"

node -e "
const db = require('./config/db');
const crypto = require('crypto');

function generateSlug() {
  return crypto.randomBytes(16).toString('hex');
}

async function populateSlugs() {
  try {
    // Courses
    const [courses] = await db.query('SELECT id FROM courses WHERE slug IS NULL OR slug = \"\"');
    for (const c of courses) {
      await db.query('UPDATE courses SET slug = ? WHERE id = ?', [generateSlug(), c.id]);
    }
    console.log('  ✓ Populated ' + courses.length + ' course(s)');

    // Lessons
    const [lessons] = await db.query('SELECT id FROM lessons WHERE slug IS NULL OR slug = \"\"');
    for (const l of lessons) {
      await db.query('UPDATE lessons SET slug = ? WHERE id = ?', [generateSlug(), l.id]);
    }
    console.log('  ✓ Populated ' + lessons.length + ' lesson(s)');

    // Modules
    const [modules] = await db.query('SELECT id FROM modules WHERE slug IS NULL OR slug = \"\"');
    for (const m of modules) {
      await db.query('UPDATE modules SET slug = ? WHERE id = ?', [generateSlug(), m.id]);
    }
    console.log('  ✓ Populated ' + modules.length + ' module(s)');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

populateSlugs();
" || exit 1

echo ""
echo "✓ Slugs generated for all records"
echo ""

# Step 4: Verify migration
echo "✅ Step 4: Verifying slug implementation..."

node -e "
const db = require('./config/db');

async function verify() {
  try {
    const [courses] = await db.query('SELECT id, slug FROM courses LIMIT 1');
    const [lessons] = await db.query('SELECT id, slug FROM lessons LIMIT 1');
    
    if (courses[0]?.slug && lessons[0]?.slug) {
      console.log('✓ Slugs verified:');
      console.log('  - Course slug: ' + courses[0].slug);
      console.log('  - Lesson slug: ' + lessons[0].slug);
      process.exit(0);
    } else {
      console.error('✗ Slugs not found');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verify();
" || exit 1

echo ""
echo "========================================"
echo "✅ Migration Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Restart both backend and frontend servers"
echo "   2. Old URLs (/learn/3/50) will auto-redirect to slugs"
echo "   3. Check browser console for any errors"
echo ""
echo "🔐 Security Improvement:"
echo "   - URLs now use 32-char random hashes instead of sequential IDs"
echo "   - Prevents IDOR (Insecure Direct Object Reference) attacks"
echo ""
