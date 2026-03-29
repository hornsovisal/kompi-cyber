# ✅ Supabase Certificate Upload - Quick Setup Checklist

## Phase 1: Credentials Setup (5 mins)

- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Copy **Project URL** from Settings → API
- [ ] Copy **Service Role Secret** from Settings → API
- [ ] Open `backend/.env` file
- [ ] Add:
  ```env
  SUPABASE_URL=your_url_here
  SUPABASE_SERVICE_ROLE_KEY=your_key_here
  ```
- [ ] Save `.env` file

## Phase 2: Storage Bucket (2 mins)

- [ ] Open Supabase Dashboard
- [ ] Click **Storage** in left sidebar
- [ ] Click **Create a new bucket**
- [ ] Name: `certificates`
- [ ] Choose **Public** (for easy certificate sharing)
- [ ] Click **Create**

## Phase 3: Test Upload (3 mins)

- [ ] Open terminal in `backend/` folder
- [ ] Run: `npm start`
- [ ] Open another terminal
- [ ] Run: `curl http://localhost:3000/api/certificates/test/upload`
- [ ] You should see a **success response** with a public URL

## Phase 4: Generate Test Certificate (5 mins)

- [ ] Make sure you're logged in on frontend
- [ ] Complete a course (or use seed data)
- [ ] Call: `POST /api/certificates/generate/:courseId`
- [ ] Check response for certificate URL
- [ ] Click the URL to view the PDF ✅

## Expected File Locations

After setup, your files should be organized like this:

**On Supabase Storage:**

```
certificates/ (bucket)
├── user_123/
│   ├── CERT-ABC123_1711604400000.pdf ✓
```

**In Database:**

```
certificates table:
- id: 1
- user_id: user_123
- course_id: 1
- certificate_code: CERT-ABC123
- pdf_path: https://...supabase.../certificates/user_123/CERT-ABC123_...pdf
- issued_at: 2025-03-28
```

## If You Get Stuck

| Error                             | Solution                                           |
| --------------------------------- | -------------------------------------------------- |
| "Bucket does not exist"           | Create `certificates` bucket in Supabase Storage   |
| "Invalid service role key"        | Copy the **Service Role Secret**, not the Anon Key |
| "Upload successful but 403 error" | Make bucket **Public** not Private                 |
| "Certificate generation fails"    | Check `.env` has correct SUPABASE_URL and KEY      |

## What's Already Done ✅

- `backend/utils/certificateService.js` - Complete with PDF generation
- `backend/controller/certificateController.js` - Updated to pass userId
- `backend/config/superbase.js` - Configured
- `backend/routes/certificateRoutes.js` - Has test endpoint
- `backend/package.json` - Has @supabase/supabase-js & pdfkit

## Command Quick Reference

```bash
# Start backend
npm start

# Test upload
curl http://localhost:3000/api/certificates/test/upload

# Check .env exists
cat backend/.env

# Test Node syntax
node -c backend/utils/certificateService.js
```

---

**Status:** 🟢 Implementation Complete - Just need to add credentials!
