# SECURITY REMEDIATON CHECKLIST
## Kompi-Cyber Security Fixes - Priority-Based

**Status:** Not Started  
**Target:** Zero Critical vulnerabilities before production

---

## ⚠️ PHASE 1: CRITICAL FIXES (WEEK 1) - MUST COMPLETE

### A. Authentication & JWT Security
- [ ] **Fix:** Backend - Replace default JWT secret fallback
  - File: `backend/middleware/authMiddleware.js` (Line 62)
  - Action: Require `JWT_SECRET` env var, throw error if missing
  - Estimated time: 30 min

- [ ] **Fix:** Backend - Add rate limiting to auth endpoints
  - File: `backend/server.js` 
  - Action: Install `express-rate-limit`, add middleware (5 attempts/15 min)
  - Estimated time: 45 min

- [ ] **Test:** Verify JWT secret is required and rate limiting blocks attempts

### B. Authorization & Access Control
- [ ] **Fix:** Backend - Fix weak admin role verification
  - File: `backend/middleware/authMiddleware.js` (Lines 52-58)
  - Action: Verify role in database, add audit logging
  - Estimated time: 1 hour

- [ ] **Fix:** Backend - Fix broken user endpoint authorization
  - File: `backend/controller/userController.js` (Lines 57-75)
  - Action: Restrict GET/PUT to own profile only, fix string comparison
  - Files affected:
    - routes/userRoutes.js
    - controller/userController.js
  - Estimated time: 1 hour

- [ ] **Test:** Verify user A cannot access user B's profile data

### C. CORS & Security Headers
- [ ] **Fix:** Backend - Restrict CORS to specific origins
  - File: `backend/server.js` (Line 26)
  - Action: Whitelist only frontend URL(s), use cors() options object
  - Estimated time: 30 min

- [ ] **Fix:** Backend - Add security headers (helmet.js)
  - File: `backend/server.js`
  - Action: Install helmet, add to app.use()
  - Features to enable:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - Strict-Transport-Security
    - CSP
  - Estimated time: 1 hour

- [ ] **Test:** Verify headers in HTTP response

### D. HTTPS/TLS
- [ ] **Fix:** Backend - Add HTTPS support (production)
  - File: `backend/server.js`
  - Action: Use https.createServer() if NODE_ENV=production
  - Estimated time: 45 min
- [ ] **Setup:** Obtain SSL certificate (Let's Encrypt)
- [ ] **Configure:** Add TLS_KEY_PATH and TLS_CERT_PATH env vars

### E. Token Storage
- [ ] **Fix:** Frontend - Move from storage to httpOnly cookies
  - Files affected:
    - frontend/src/pages/Login.jsx
    - frontend/src/pages/Dashboard.jsx
    - frontend/src/pages/LearnPage.jsx
    - frontend/src/utils/auth.js
    - frontend/src/components/StudentInvitations.jsx
  - Action: Remove all localStorage/sessionStorage token access
  - Backend must set cookies with httpOnly, Secure, SameSite flags
  - Estimated time: 2 hours
- [ ] **Test:** Verify tokens in httpOnly cookies, not accessible to JS

### F. Input Validation
- [ ] **Fix:** Backend - Add comprehensive input validation to auth
  - File: `backend/middleware/authMiddleware.js`
  - Action: Validate email format, password complexity, name length
  - Estimated time: 1.5 hours
  - Test cases needed:
    - Email format validation
    - Password complexity (12+ chars, upper, lower, number, special)
    - Name length (2-120 chars)
    - No SQL injection payloads accepted

---

## 🔴 PHASE 2: HIGH PRIORITY (WEEK 2) - MUST COMPLETE

### G. File & Data Security
- [ ] **Fix:** Backend - Add auth requirement to file serving
  - File: `backend/server.js` (Lines 28-30)
  - Action: Prevent public access to /upload, validate filenames
  - Prevent path traversal: reject '..' in filenames
  - Estimated time: 1 hour

- [ ] **Fix:** Backend - Remove hardcoded credentials from scripts
  - File: `backend/scripts/merge-to-single-db.js` (Line 4)
  - Action: Use process.env for all credentials
  - Estimated time: 30 min

- [ ] **Fix:** Frontend - Remove sensitive user data from localStorage
  - File: `frontend/src/pages/Login.jsx` (Line 85)
  - Action: Don't store user object, fetch from /api/users/me on demand
  - Estimated time: 30 min

### H. CSRF Protection
- [ ] **Fix:** Backend - Implement CSRF token protection
  - Files: `backend/server.js`, all routes with POST/PUT/DELETE
  - Action: Install csrf middleware, generate tokens, validate on state-change
  - Estimated time: 2 hours

- [ ] **Fix:** Frontend - Include CSRF tokens in state-changing requests
  - Files: All components making POST/PUT/DELETE requests
  - Estimated time: 1.5 hours

### I. Data Access Control
- [ ] **Fix:** Backend - Restrict certificate endpoint to authenticated users
  - File: `backend/routes/certificateRoutes.js` (Lines 49-52)
  - Action: Add authMiddleware.authenticateToken to /view/:hash
  - Verify ownership before returning certificate data
  - Estimated time: 30 min

- [ ] **Fix:** Backend - Add file size limits
  - File: `backend/server.js`
  - Action: Add limits to express.json() and upload middleware
  - Limits:
    - JSON body: 1MB
    - File upload: 50MB
  - Estimated time: 30 min

### J. Password & Authentication Policy
- [ ] **Fix:** Backend - Implement password complexity requirements
  - File: `backend/middleware/authMiddleware.js`
  - Action: Enforce 12+ chars, uppercase, lowercase, number, special char
  - Estimated time: 30 min

- [ ] **Fix:** Backend - Implement account lockout
  - Files: `backend/controller/authController.js`, `backend/models/userModel.js`
  - Action: Track failed attempts, lock after 5 attempts for 30 minutes
  - Estimated time: 1.5 hours

### K. Dependencies
- [ ] **Audit:** Run `npm audit` in both frontend and backend
  - Command: `npm audit --production`
  - Fix all vulnerabilities

- [ ] **Update:** Review and update dependencies
  - backend: aws-sdk → @aws-sdk/client-s3, remove bcrypt duplication
  - frontend: axios (old version), react-router-dom updates
  - Estimated time: 2 hours

---

## 🟡 PHASE 3: IMPORTANT (WEEK 3) - SHOULD COMPLETE

### L. Error Handling & Logging
- [ ] **Fix:** Backend - Implement structured logging
  - Files: All error handlers
  - Action: Use unique error IDs, sanitize error messages returned to client
  - Estimated time: 1 hour

- [ ] **Test:** Verify no sensitive data in error responses

### M. Frontend Security
- [ ] **Fix:** Frontend - Add CSP headers
  - Files: frontend/index.html or vite.config.js
  - Action: Set Content-Security-Policy meta tag/header
  - Estimated time: 30 min

- [ ] **Fix:** Frontend - Validate dynamic URLs (XSS prevention)
  - File: `frontend/src/pages/Dashboard.jsx`, `ViewCertificate.jsx`
  - Action: Whitelist domains for image src, reject javascript: and data:
  - Estimated time: 30 min

### N. Email Security
- [ ] **Fix:** Backend - Consistent email enumeration responses
  - File: `backend/controller/authController.js` (Password reset, verification endpoints)
  - Action: Use generic responses for all email verification endpoints
  - Estimated time: 30 min

### O. Environment & Startup
- [ ] **Fix:** Backend - Add environment variable validation
  - File: `backend/server.js`
  - Action: Check all required env vars exist before starting
  - Required vars:
    - JWT_SECRET
    - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
    - FRONTEND_URL
    - NODE_ENV
  - Estimated time: 30 min

- [ ] **Test:** Verify app crashes if required env var missing

### P. Database & Supabase
- [ ] **Fix:** Backend - Use Supabase ANON key instead of SERVICE ROLE key
  - File: `backend/config/superbase.js`
  - Action: Switch to ANON_KEY for API, implement RLS on storage bucket
  - Estimated time: 1 hour

- [ ] **Fix:** Backend - Implement Row Level Security (RLS) on Supabase
  - Action: Create RLS policies to ensure users can only access own data
  - Estimated time: 1.5 hours

---

## ✅ VERIFICATION TESTS (Run After Each Phase)

### Phase 1 Tests
```bash
# JWT Secret
curl -X GET http://localhost:5000/api/users/me  # Should fail without token

# Rate Limiting  
for i in {1..10}; do curl -X POST http://localhost:5000/api/auth/login; done
# Should get 429 Too Many Requests after 5 attempts

# CORS
curl -H "Origin: https://attacker.com" http://localhost:5000/api/users/me
# Should reject request

# Security Headers
curl -I http://localhost:5000
# Should contain X-Content-Type-Options, X-Frame-Options, etc.
```

### Phase 2 Tests
```bash
# Authorization
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users/$OTHER_USER_ID
# Should return 403 Forbidden

# CSRF
curl -X POST http://localhost:5000/api/enrollments -d '{}' -H "Content-Type: application/json"
# Should reject: No CSRF token provided

# File Access
curl http://localhost:5000/upload/lesson/../../.env
# Should return 400 or 403
```

### Phase 3 Tests
```bash
# Error handling
curl http://localhost:5000/api/invalid-endpoint
# Response should not contain SQL errors or file paths

# CSP Headers
curl -I http://localhost:3000
# Should have Content-Security-Policy header

# Email Enumeration
curl -X POST http://localhost:5000/api/auth/forgot-password -d '{"email":"nonexistent@test.com"}'
curl -X POST http://localhost:5000/api/auth/forgot-password -d '{"email":"registered@test.com"}'
# Both should return identical response
```

---

## 📋 DEPLOYMENT CHECKLIST

Before going to production:

- [ ] All CRITICAL phase 1 fixes completed and tested
- [ ] All HIGH phase 2 fixes completed and tested
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] HTTPS/TLS certificate obtained and configured
- [ ] Environment variables set (not hardcoded)
- [ ] `.env` file in `.gitignore`
- [ ] `.gitignore` verified has no secrets
- [ ] Database backup strategy implemented
- [ ] Logging system configured (ELK stack, CloudWatch, etc.)
- [ ] Monitoring alerts set up (failed logins, errors, performance)
- [ ] Security headers verified in production (curl -I)
- [ ] Rate limiting tested in production environment
- [ ] Database credentials rotated (new admin user for production)
- [ ] Secrets manager configured (AWS Secrets Manager, Vault, etc.)
- [ ] Load testing completed (verify rate limiting under load)
- [ ] Penetration testing scheduled
- [ ] Documentation updated with security policies
- [ ] Team trained on security best practices

---

## 📊 PROGRESS TRACKING

| Phase | Status | Completion % | Target Date |
|-------|--------|-------------|-------------|
| Phase 1 | Not Started | 0% | Week 1 |
| Phase 2 | Not Started | 0% | Week 2 |
| Phase 3 | Not Started | 0% | Week 3 |
| **Total** | **Not Started** | **0%** | **3 weeks** |

**Estimated Total Time:** 25-30 developer hours across team

---

**Last Updated:** April 1, 2026  
**Next Review:** Weekly security meeting every Monday at 10 AM
