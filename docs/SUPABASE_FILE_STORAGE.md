# Supabase File Storage Configuration

## Overview

The application now uses **Supabase Storage** for persistent file management across Vercel and Railway deployments. Two buckets are configured:

1. **`certificates`** - Student certificate PDFs
2. **`upload-lesson`** - Course lesson files and assets

## Environment Variables

Add these to your `.env` file in the `backend/` directory:

```env
# Supabase Storage Buckets
SUPABASE_CERTIFICATE_BUCKET=certificates
SUPABASE_LESSON_BUCKET=upload-lesson
```

The `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must also be set.

## Bucket Setup in Supabase Dashboard

### 1. Create Buckets

Go to **Storage** in your Supabase dashboard and create:

- **Bucket name:** `certificates`
- **Bucket name:** `upload-lesson`

### 2. Set Public Access

For public file access (CDN delivery), update bucket policies:

```sql
-- For certificates bucket
SELECT bucketid FROM storage.buckets WHERE name = 'certificates';

-- For upload-lesson bucket
SELECT bucketid FROM storage.buckets WHERE name = 'upload-lesson';
```

Set the public policy on both buckets in the dashboard.

## Usage in Code

### Uploading Certificates

```javascript
const {
  uploadCertificate,
  generateCertificate,
} = require("../utils/certificateService");

// Automatically uploads to Supabase, falls back to local if missing
const publicUrl = await generateCertificate({
  studentName: "John Doe",
  courseName: "Intro to Cyber",
  certificateCode: "CERT-2024-001",
  issuedAt: new Date(),
  courseLevel: "Beginner",
  stats: { score: 95, completedAt: "2024-04-01" },
});
```

### Uploading Lesson Files

```javascript
const { uploadLessonFile, getContentType } = require("../utils/lessonService");

// Upload a lesson file to Supabase
const fileContent = fs.readFileSync("lesson.md");
const publicUrl = await uploadLessonFile(
  "intro-to-cyber", // courseSlug
  "lesson-01.md", // fileName
  fileContent,
  getContentType("lesson.md"),
);
```

## Fallback Behavior

If Supabase is not configured:

- **Certificates**: Saved to `upload/certificates/<user-id>/`
- **Lessons**: Saved to `upload/lesson/<course-slug>/`

Both endpoints return valid local paths like `/upload/lesson/intro-to-cyber/lesson-01.md`.

## File Path Structure in Supabase

```
certificates/
├── user_id_1/
│   ├── cert_*.pdf
│   └── cert_*.pdf
└── user_id_2/
    └── cert_*.pdf

upload-lesson/
├── intro-to-cyber/
│   ├── cover.png
│   ├── lesson-01.md
│   └── lesson-02.md
├── intro-to-linux/
│   ├── cover.png
│   └── ...
└── ...
```

## Deployment Considerations

### Railway / Vercel Ephemeral Filesystems

These platforms do NOT persist local filesystem changes. Using Supabase Storage ensures:

- ✅ Files persist across deployments
- ✅ Files accessible from any replica
- ✅ CDN delivery through Supabase

### Local Development

Set `NODE_ENV=development` in `.env`:

- Files go to local `/upload/` directory
- Useful for testing without Supabase

## Troubleshooting

### "Supabase not configured" warning

**Cause:** `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` not set

**Fix:** Add to `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx
```

### Files not uploading to Supabase

1. Verify bucket names match `.env` variables
2. Check service role key has storage permissions
3. Ensure buckets are created and public access allowed
4. Check backend logs for specific Supabase error

### Mixing local and cloud files

After enabling Supabase, old local files won't migrate automatically. To migrate:

```bash
# Run migration script (create this if needed)
node scripts/migrate-files-to-supabase.js
```

## Security Notes

- Service role key allows full storage access (keep it secret)
- Use Supabase RLS policies to restrict bucket access in production
- Certificates are public by default (signed URLs can be generated for privacy)
