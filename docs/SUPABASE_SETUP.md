# Supabase Certificate Upload Setup Guide

## What's Implemented

You now have a complete certificate upload system using **Supabase Storage** with the Supabase JS client. This includes:

- ✅ **certificateService.js** - Handles PDF generation and Supabase uploads
- ✅ **certificateController.js** - Generates certificates on course completion
- ✅ **Supabase Config** - Already configured in `config/superbase.js`
- ✅ **Test Endpoint** - Available at `GET /api/certificates/test/upload`

## Setup Steps

### 1. **Verify Supabase Credentials** (CRITICAL ⚠️)

Make sure your `.env` file in the `backend/` folder has:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
```

**How to get these:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. **Create the Storage Bucket**

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name it: `certificates`
4. Choose **Public** or **Private**:
   - **Public**: Anyone can view certificates with the URL (recommended)
   - **Private**: Only authenticated users can view

**Recommended:** Set to **Public** for easy certificate sharing

### 3. **Verify Dependencies**

All required packages are already installed:

```bash
cd backend
npm list @supabase/supabase-js pdfkit
```

Should show:

- `@supabase/supabase-js@^2.100.1` ✓
- `pdfkit@^0.18.0` ✓

### 4. **Test the Setup**

Start your backend server:

```bash
npm start
```

Then test the upload endpoint:

```bash
curl http://localhost:3000/api/certificates/test/upload
```

You should get:

```json
{
  "message": "Upload successful",
  "filename": "test-1711604400000.pdf",
  "publicUrl": "https://your-project.supabase.co/storage/v1/object/public/certificates/test-1711604400000.pdf"
}
```

## How It Works

### Certificate Generation Flow

```
1. User completes a course
   ↓
2. POST /api/certificates/generate/:courseId
   ↓
3. Controller validates completion
   ↓
4. Service generates PDF with pdfkit
   ↓
5. PDF uploaded to Supabase Storage
   ↓
6. Public URL returned and saved to database
   ↓
7. Certificate displayed to user
```

### File Organization in Storage

Certificates are organized by user ID:

```
certificates/
├── user_123/
│   ├── cert_abc123_1711604400000.pdf
│   └── cert_def456_1711604401000.pdf
├── user_456/
│   └── cert_ghi789_1711604402000.pdf
```

## API Endpoints

### Generate Certificate

```http
POST /api/certificates/generate/:courseId
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "message": "Certificate generated successfully",
  "certificate": {
    "id": 1,
    "certificate_code": "CERT-ABC123",
    "student_name": "John Doe",
    "course_name": "Introduction to Cybersecurity",
    "issued_at": "2025-03-28T10:00:00.000Z",
    "pdf_path": "https://your-project.supabase.co/storage/v1/object/public/certificates/user_123/CERT-ABC123_1711604400000.pdf"
  },
  "certificateUrl": "https://..."
}
```

### Test Upload

```http
GET /api/certificates/test/upload
```

Tests Supabase connection and upload capability.

## Troubleshooting

### Issue: "Bucket does not exist"

**Solution:** Create the `certificates` bucket in Supabase Storage

### Issue: "Service role key is invalid"

**Solution:**

- Verify you copied the **Service Role Secret**, not the Anon Key
- Check for leading/trailing spaces in `.env`

### Issue: "Upload successful but URL is 403 Forbidden"

**Solution:** Make sure the bucket is set to **Public** in Supabase Storage settings

### Issue: "PDFKit errors"

**Solution:**

- Ensure pdfkit is installed: `npm install pdfkit`
- Check Node.js version: `node --version` (should be 14+)

## Certificate PDF Content

The generated certificate includes:

- Student name
- Course name
- Course level (Professional/Intermediate/Beginner)
- Completion stats:
  - Lessons completed
  - Average score (if applicable)
- Certificate code (unique identifier)
- Issue date

Customize the PDF design in `backend/utils/certificateService.js` in the `generateCertificate()` function (lines 38-85).

## Environment Variables Needed

Add to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Customize bucket name (default: "certificates")
SUPABASE_BUCKET=certificates
```

## Security Notes

- ✅ Uses **Service Role Key** (backend only) - never expose to frontend
- ✅ Certificates organized by user ID in storage
- ✅ Database tracks certificate ownership
- ✅ JWT authentication required for generation
- 🔒 Recommended: Set bucket to **Private** and require auth for downloads in production

## Next Steps

1. ✅ Complete credentials in `.env`
2. ✅ Create `certificates` bucket in Supabase
3. ✅ Run `npm start` in backend
4. ✅ Test with curl/Postman
5. ✅ User completes a course → Certificate auto-generated
6. ✅ Download/share certificate from frontend

---

**Questions?** Check [Supabase Storage Docs](https://supabase.com/docs/guides/storage) or [PDFKit Docs](http://pdfkit.org/)
