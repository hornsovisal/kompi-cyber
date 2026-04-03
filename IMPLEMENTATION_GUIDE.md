# Kompi-Cyber Platform - Implementation Guide

## Overview

This document outlines the complete implementation of instructor-student workflows, coordinator functionality, security enhancements, and scalability improvements for the Kompi-Cyber platform.

---

## 1. Roles & Permissions

### Role Hierarchy

- **Role ID 1**: Student - Can enroll, view courses, submit work, track progress
- **Role ID 2**: Instructor - Can create/clone courses, invite students, view progress, grade
- **Role ID 3**: Admin - Full system access, manage users, manage domains
- **Role ID 4**: Coordinator - Design courses, manage curriculum (optional, can use role 2)

### Permission Matrix

| Feature         | Student | Instructor | Coordinator | Admin |
| --------------- | ------- | ---------- | ----------- | ----- |
| View Courses    | ✅      | ✅         | ✅          | ✅    |
| Enroll          | ✅      | ❌         | ❌          | ✅    |
| Create Course   | ❌      | ✅         | ✅          | ✅    |
| Clone Course    | ❌      | ✅         | ✅          | ✅    |
| Invite Students | ❌      | ✅         | ✅          | ✅    |
| Add Quiz        | ❌      | ✅         | ✅          | ✅    |
| View Progress   | ❌      | ✅\*       | ✅\*        | ✅    |
| Submit Work     | ✅      | ❌         | ❌          | ❌    |

\*Instructors/Coordinators can only view for their courses

---

## 2. Key Features Implementation

### A. Course Cloning

**Endpoint**: `POST /api/courses/{courseId}/clone`

**Required**: Instructor or Admin role

**Request**:

```json
{
  "titleSuffix": "(Cloned by John Doe - 2024)"
}
```

**Response**:

```json
{
  "message": "Course cloned successfully",
  "sourceId": 5,
  "newCourseId": 12,
  "course": {
    /* full course object */
  }
}
```

**What Gets Cloned**:

- Course metadata (title, description, level, duration)
- All modules and lessons
- Quiz structure and questions
- Exercise templates
- New course starts as unpublished

**Use Case**: Teachers can clone existing courses to teach to different cohorts without recreating content.

---

### B. Student Invitation System

#### Step 1: Teacher Sends Invitation

**Endpoint**: `POST /api/invitations/send`

```json
{
  "courseId": 5,
  "studentEmails": ["student1@example.com", "student2@example.com"]
}
```

#### Step 2: Student Views Invitations

**Endpoint**: `GET /api/invitations`

Returns all pending invitations for the logged-in student.

#### Step 3: Student Accepts/Rejects

**Endpoint**: `POST /api/invitations/{invitationId}/accept`

When student accepts:

- Invitation status changes to "accepted"
- Student is auto-enrolled in the course
- Automatic email sent to teacher

#### Teacher Views Invitation Status

**Endpoint**: `GET /api/invitations/course/{courseId}`

Shows all invitations sent for a course with responses.

---

### C. Student Progress Tracking

#### Teacher Views All Students' Progress

**Endpoint**: `GET /api/progress/courses/{courseId}`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid-123",
      "full_name": "John Doe",
      "email": "john@example.com",
      "submissions_count": 8,
      "graded_submissions": 7,
      "average_score": 85.5
    }
    // ... more students
  ]
}
```

#### Teacher Views Individual Student Progress

**Endpoint**: `GET /api/progress/courses/{courseId}/students/{studentId}`

**Response**:

```json
{
  "success": true,
  "data": {
    "student": { "id": "uuid", "full_name": "John Doe", "email": "..." },
    "submissions": [
      {
        "lesson_id": 42,
        "lesson_title": "Network Basics",
        "score": 92,
        "submitted_at": "2024-04-03T10:30:00Z",
        "feedback": "Great work!"
      }
    ],
    "modules": [
      {
        "id": 1,
        "title": "Module 1: Fundamentals",
        "total_lessons": 5,
        "completed_lessons": 4
      }
    ],
    "stats": {
      "totalSubmissions": 5,
      "gradedSubmissions": 5,
      "averageScore": 88.2,
      "completionPercentage": 80
    }
  }
}
```

#### Student Views Their Own Progress

**Endpoint**: `GET /api/progress/my-progress/{courseId}`

Same format as above, but shows the logged-in student's progress.

---

## 3. Security Enhancements

### A. Input Validation & Sanitization

**Implemented in**: `ValidationMiddleware`

**Features**:

- String sanitization (XSS prevention)
- Email validation
- Strong password enforcement:
  - Minimum 8 characters
  - At least 1 uppercase
  - At least 1 lowercase
  - At least 1 number
  - At least 1 special character
- Numeric ID validation
- Pagination parameter validation

**Applied to all endpoints via** `app.use(ValidationMiddleware.sanitizeRequestData)`

### B. Rate Limiting

**Three Levels**:

1. **Login & Registration (Strictest)**
   - 5 attempts per 15 minutes
   - Prevents brute force attacks

2. **API General**
   - 100 requests per minute
   - Applied to all `/api/` routes

3. **Sensitive Operations (Hourly)**
   - 10 requests per hour
   - For password reset, account changes

### C. SQL Injection Protection

**Implementation**:

- All queries use parameterized statements
- Database library (mysql2/promise) handles escaping
- Input validation prevents malicious payloads

**Example - Safe Query**:

```javascript
const query = `SELECT * FROM users WHERE id = ? AND email = ?`;
const [rows] = await db.execute(query, [userId, email]);
```

### D. CORS & CSRF Protection

**CORS Configuration**:

- Strict whitelist of allowed origins
- Production mode restricts to frontend URL only
- Credentials allowed only for whitelisted origins

**Environment Variables** (add to `.env`):

```bash
FRONTEND_URL=https://yourdomain.com
```

### E. Security Headers

**Already Implemented via Helmet**:

- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Strict-Transport-Security (HTTPS enforcement)
- Content-Security-Policy
- X-XSS-Protection

---

## 4. Scalability Improvements

### A. Pagination

**Applied to**: Course listing

**Query Parameters**:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Example**:

```
GET /api/courses?page=1&limit=20
GET /api/courses?page=2&limit=50
```

**Response Format**:

```json
{
  "courses": [
    /* ... */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### B. Database Query Optimization

**Implemented**:

- Indexed foreign keys in database schema
- JOIN optimization in progress queries
- Subquery optimization using GROUP BY
- Connection pooling via mysql2

### C. Caching Strategy

**Implemented in server.js**:

- Static assets cached for 1 year (immutable)
- API GET responses cached for 5 minutes locally
- ETags enabled for efficient cache validation

---

## 5. Workflow Scenarios

### Scenario 1: Teacher Setting Up a Course

```
1. Teacher logs in (role_id = 2)
2. Can create new course or clone existing one
3. Adds modules, lessons, quizzes
4. Publishes course
5. Invites students by email
6. Monitors student progress in real-time
```

### Scenario 2: Student Accepting Invitation

```
1. Student receives email invitation
2. Student logs in
3. Views pending invitations at /api/invitations
4. Clicks "Accept"
5. Gets auto-enrolled
6. Can access course content
7. Can view their progress via /api/progress/my-progress/{courseId}
```

### Scenario 3: Teacher Evaluating Class

```
1. Teacher logs in
2. Views all students' progress: GET /api/progress/courses/{courseId}
3. Identifies struggling students
4. Clicks on individual student
5. Views detailed progress: GET /api/progress/courses/{courseId}/students/{studentId}
6. Provides feedback on submissions
7. Tracks which students completed all lessons
```

---

## 6. Database Schema Updates

### New/Modified Tables

#### course_invitations (already exists)

```sql
CREATE TABLE course_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  teacher_id CHAR(36) NOT NULL,
  student_email VARCHAR(150) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  student_id CHAR(36),
  UNIQUE KEY (course_id, student_email),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);
```

**Ensure indices exist** for performance:

```sql
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
```

---

## 7. API Endpoints Summary

### Authentication

- `POST /api/auth/register` - Strong password validation
- `POST /api/auth/login` - Rate limited
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Courses

- `GET /api/courses` - Paginated
- `GET /api/courses/:id` - Get by ID
- `POST /api/courses/:id/clone` - Requires Instructor role
- `PUT /api/courses/:id` - Admin only
- `DELETE /api/courses/:id` - Admin only

### Invitations

- `GET /api/invitations` - Student's pending invitations
- `POST /api/invitations/send` - Teacher sends invitations
- `POST /api/invitations/:id/accept` - Student accepts
- `POST /api/invitations/:id/reject` - Student rejects
- `GET /api/invitations/course/:courseId` - Teacher views course invitations

### Progress

- `GET /api/progress/courses/:courseId` - All students (instructor only)
- `GET /api/progress/courses/:courseId/students/:studentId` - Individual student (instructor only)
- `GET /api/progress/my-progress/:courseId` - Student's own progress

---

## 8. Environment Configuration

### Required .env Variables

```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=kompicyber
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Frontend
FRONTEND_URL=https://yourfrontend.com

# Email (if using email service)
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Node Environment
NODE_ENV=production
PORT=5000
```

---

## 9. Migration Steps

### For Existing Deployments

1. **Backup Database**:

   ```bash
   mysqldump -u root -p kompicyber > backup.sql
   ```

2. **Update Dependencies**:

   ```bash
   npm install validator express-rate-limit
   ```

3. **Deploy Code Changes**:
   - `server.js` - Add ValidationMiddleware
   - New middleware files
   - New routes and controllers
   - Updated auth routes

4. **Restart Server**:
   ```bash
   npm start
   ```

---

## 10. Testing Checklist

- [ ] **Course Cloning**: Clone course and verify all content copies
- [ ] **Invitations**: Send invitation, accept as student, auto-enrollment works
- [ ] **Progress Tracking**: Submit work, verify progress shows correctly
- [ ] **Strong Passwords**: Weak passwords rejected at registration
- [ ] **Rate Limiting**: Verify login attempts throttled after 5 failures
- [ ] **Pagination**: Test with different page/limit values
- [ ] **SQL Injection**: Try malicious input, verify rejected
- [ ] **CORS**: Test requests from non-whitelisted origin, verify blocked
- [ ] **Authorization**: Non-instructors can't clone/invite/view progress
- [ ] **Performance**: Load test with many students, verify response times

---

## 11. Monitoring & Maintenance

### Log Important Events

```javascript
// In controllers
console.log(
  `Instructor ${teacherId} cloned course ${sourceId} to ${newCourseId}`,
);
console.log(`Student ${studentId} accepted invitation for course ${courseId}`);
```

### Monitor Performance

- Check slow query logs
- Monitor error rates
- Track API response times
- Monitor database connection pool

### Regular Maintenance

- Review failed login attempts (rate limit logs)
- Clean up old/rejected invitations
- Archive historical progress data
- Update dependencies monthly

---

## 12. Troubleshooting

### Issue: Invitations not working

**Solution**: Verify `course_invitations` table exists and has correct schema.

### Issue: Progress not showing

**Solution**: Verify `submissions` table has `course_id` field and indices on `user_id`, `course_id`.

### Issue: Password validation too strict

**Solution**: Modify `ValidationMiddleware.isStrongPassword()` method.

### Issue: Rate limiting too restrictive

**Solution**: Adjust `windowMs` and `max` values in rate limit configuration.

---

## 13. Next Steps & Future Enhancements

1. **Email Notifications**
   - Welcome email on enrollment
   - Progress milestones
   - Invitation reminders

2. **Certificates**
   - Auto-generate on completion
   - Digital signatures
   - Blockchain verification (optional)

3. **Analytics Dashboard**
   - Class-wide statistics
   - Success rate tracking
   - Time spent analysis

4. **Mobile App**
   - React Native version
   - Offline progress resumption

5. **Gamification**
   - Points system
   - Leaderboards
   - Badges

---

## Document Version

- **Created**: April 3, 2024
- **Last Updated**: April 3, 2024
- **Version**: 1.0
