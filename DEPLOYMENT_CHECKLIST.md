# Deployment & Setup Checklist

## Pre-Deployment Checklist

### Code Changes Implemented ✅
- [x] Course cloning functionality added to `courseModel.js` and `courseController.js`
- [x] Routes updated with `/api/courses/:id/clone` endpoint  
- [x] Input validation middleware created (`validationMiddleware.js`)
- [x] Strong password validation implemented
- [x] Rate limiting configured on auth endpoints
- [x] Student progress tracking APIs created
- [x] Progress routes and controller added
- [x] Coordinator role support enhanced in auth middleware
- [x] Pagination support added to courses listing
- [x] OWASP security headers configured (Helmet)
- [x] CORS protection implemented

### Dependencies to Install
```bash
cd backend
npm install validator
```

### File Changes Summary

#### New Files Created
1. `/backend/middleware/validationMiddleware.js` - Input validation & rate limiting
2. `/backend/controller/progressController.js` - Student progress tracking
3. `/backend/routes/progressRoutes.js` - Progress API routes
4. `/IMPLEMENTATION_GUIDE.md` - Complete documentation

#### Files Modified
1. `/backend/server.js` - Added validation middleware and progress routes
2. `/backend/middleware/authMiddleware.js` - Updated coordinator role support
3. `/backend/models/courseModel.js` - Added cloneCourse method
4. `/backend/controller/courseController.js` - Added cloneCourse endpoint and pagination
5. `/backend/routes/courseRoutes.js` - Added clone endpoint route
6. `/backend/routes/authRoutes.js` - Added rate limiting and better validation
7. `/backend/package.json` - Added validator dependency

---

## Deployment Steps

### 1. Local Testing

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up .env file (if not exists)
cp .env.example .env

# Update .env with your settings
# - DB credentials
# - JWT secret
# - Frontend URL
# - Other environment variables

# Start server
npm start
```

### 2. Test New Endpoints

**Test Course Cloning**:
```bash
curl -X POST http://localhost:5000/api/courses/1/clone \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titleSuffix": "(Test Clone)"}'
```

**Test Progress Endpoint**:
```bash
curl -X GET http://localhost:5000/api/progress/courses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test Strong Password Validation**:
```bash
# This should fail (weak password)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "password": "weak"}'

# This should succeed (strong password)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "password": "SecurePass123!"}'
```

### 3. Production Deployment

#### Railway/Vercel Deployment

1. **Update Environment Variables**:
   ```bash
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.com
   JWT_SECRET=generate-new-strong-secret
   DB_HOST=your-production-db-host
   ```

2. **Push to Git**:
   ```bash
   git add .
   git commit -m "feat: Add course cloning, progress tracking, and security enhancements"
   git push origin main
   ```

3. **Verify Deployment**:
   ```bash
   # Test endpoints on production
   curl https://your-api-domain.com/api/courses \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

#### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
docker build -t kompi-cyber-backend .
docker run -p 5000:5000 --env-file .env kompi-cyber-backend
```

---

## Testing Scenarios

### Scenario 1: Complete Workflow

```
1. Register as Instructor (password: SecurePass123!)
2. Login and get JWT token
3. Create a course
4. Clone the course
5. Invite student by email
6. (As student) Accept invitation
7. (As teacher) View student progress
8. (As student) View own progress
```

### Scenario 2: Security Testing

```
1. Try weak password: "password" - should fail
2. Try 6 failed logins - should be rate limited  
3. Try SQL injection in email: "'; DROP TABLE users; --" - should be sanitized
4. Try XSS payload: "<script>alert('xss')</script>" - should be escaped
5. Try access with expired token - should get 401
```

### Scenario 3: Pagination Testing

```
GET /api/courses?page=1&limit=10
GET /api/courses?page=2&limit=10
GET /api/courses?page=1&limit=200  # Should cap at 100
```

---

## Rollback Plan

If issues occur, you can rollback:

```bash
git revert HEAD
npm install  # Re-install previous dependencies
npm start
```

The database schema is backward compatible, as the new fields are optional.

---

## Monitoring After Deployment

### Key Metrics to Track
- [ ] API response times (target: <200ms for GET, <500ms for POST)
- [ ] Error rates (target: <0.1%)
- [ ] Failed login attempts (monitor for attacks)
- [ ] Rate limit hits (indicates system load or attacks)
- [ ] Database query performance (check slow query log)

### Logging
Check your application logs for:
- Authentication failures
- Database connection issues
- Validation errors
- Rate limiting events

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "ValidationMiddleware not found" | Run `npm install` in backend directory |
| "validator is not defined" | Update package.json and run `npm install validator` |
| Rate limiting too strict | Adjust `windowMs` and `max` values in validationMiddleware.js |
| Course clone fails | Check if source course exists and all modules/lessons have IDs |
| Progress shows 0% | Verify submissions table has data for the course |
| Invitations not working | Check email service configuration in .env |

---

## Support & Documentation

- Full implementation guide: See `IMPLEMENTATION_GUIDE.md`
- API documentation: Check auth routes, course routes, progress routes
- Database schema: See `database/schema.sql`
- Example requests: See curl commands in "Test New Endpoints" section

---

## Sign-Off

- [ ] All code reviewed
- [ ] Tests passed locally
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database backed up
- [ ] Team notified of changes
- [ ] Deployment completed successfully
- [ ] Monitoring active
- [ ] Rollback plan ready

---

**Last Updated**: April 3, 2024
**Version**: 1.0
**Status**: Ready for Deployment
