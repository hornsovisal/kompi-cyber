# Test Accounts - Kompi-Cyber Platform

**Last Updated**: April 3, 2026

## Overview

This document contains all test accounts for development and testing. Use these credentials to login to different roles.

---

## Account Structure

| Role               | Role ID | Can Create Courses | Can Invite Students | Can Grade | Notes                     |
| ------------------ | ------- | ------------------ | ------------------- | --------- | ------------------------- |
| Student            | 1       | ❌                 | ❌                  | ❌        | Can enroll, view progress |
| Instructor/Teacher | 2       | ✅                 | ✅                  | ✅        | Can manage own courses    |
| Admin              | 3       | ✅                 | ✅                  | ✅        | System-wide access        |
| Coordinator        | 4       | ✅                 | ✅                  | ✅        | Curriculum design         |

---

## 🔐 Test Accounts & Passwords

### 1. STUDENT ACCOUNT

```
Email:    student@kompi-cyber.local
Password: StudentPass123!
Role ID:  1
```

**Access**: Can view courses, enroll, submit assignments, view own progress

**Test Login**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@kompi-cyber.local",
    "password": "StudentPass123!"
  }'
```

---

### 2. TEACHER/INSTRUCTOR ACCOUNT (STRICT ROLE)

```
Email:    teacher@kompi-cyber.local
Password: TeacherPass123!
Role ID:  2
```

**Access**: Can create courses, clone courses, invite students, grade assignments, view student progress

**Restrictions**: Cannot access admin panel (will get 403 error if tries)

**Test Login**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@kompi-cyber.local",
    "password": "TeacherPass123!"
  }'
```

**Test Course Cloning** (Teacher only):

```bash
curl -X POST http://localhost:5000/api/courses/1/clone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"titleSuffix": "(Q2 Clone)"}'
```

**Test Inviting Students**:

```bash
curl -X POST http://localhost:5000/api/invitations/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "courseId": 1,
    "studentEmails": ["student@kompi-cyber.local"]
  }'
```

**Test View All Students Progress**:

```bash
curl http://localhost:5000/api/progress/courses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. COORDINATOR ACCOUNT (STRICT ROLE)

```
Email:    coordinator@kompi-cyber.local
Password: CoordinatorPass123!
Role ID:  4
```

**Access**: Can design curriculum, manage courses, coordinate between teachers

**Restrictions**: Cannot access admin panel, different from teacher role

**Test Login**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordinator@kompi-cyber.local",
    "password": "CoordinatorPass123!"
  }'
```

---

### 4. ADMIN ACCOUNT

```
Email:    admin@kompi-cyber.local
Password: AdminPass123!
Role ID:  3
```

**Access**: Full system access - everything

**Test Login**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kompi-cyber.local",
    "password": AdminPass123!"
  }'
```

---

## 🛡️ Middleware Checks

### Role-Only Middleware

#### Teacher Only (roleId = 2 ONLY)

```javascript
// In routes
router.post(
  "/teacher-route",
  authMiddleware.requireTeacherOnly,
  controller.method,
);
```

✅ Allows: Role 2 (Teacher)
❌ Blocks: Role 1, 3, 4

#### Coordinator Only (roleId = 4 ONLY)

```javascript
// In routes
router.post(
  "/coordinator-route",
  authMiddleware.requireCoordinatorOnly,
  controller.method,
);
```

✅ Allows: Role 4 (Coordinator)
❌ Blocks: Role 1, 2, 3

---

## 📝 Role-Based Endpoint Access

### Student Routes

- `GET /api/progress/my-progress/:courseId` - View own progress
- `GET /api/invitations` - View pending invitations
- `POST /api/invitations/:id/accept` - Accept invitation
- `GET /api/courses` - Browse courses

### Teacher Routes (requireInstructor = 2 or 3)

- `POST /api/courses/:id/clone` - Clone course
- `POST /api/invitations/send` - Send invitations
- `GET /api/progress/courses/:courseId` - View all students
- `GET /api/progress/courses/:courseId/students/:studentId` - View student details

### Coordinator Routes (requireCoordinator = 2, 3, or 4)

- Can access same as teacher
- Plus curriculum management features

### Admin Routes (requireAdmin = 3 ONLY)

- Full system access
- User management
- System configuration

---

## 🔑 JWT Token Format

After login, the response includes a JWT token:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "fullName": "Teacher Name",
    "email": "teacher@kompi-cyber.local",
    "roleId": 2,
    "isActive": true
  }
}
```

**Token Payload**:

```json
{
  "sub": "user-id",
  "email": "user@domain.com",
  "roleId": 2,
  "iat": 1712177280,
  "exp": 1712180880
}
```

**Token Expiry**: 1 hour

---

## 📋 Quick Reference: Login Command

**Copy-paste format** (replace with your account):

```bash
# Student
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@kompi-cyber.local", "password": "StudentPass123!"}'

# Teacher
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@kompi-cyber.local", "password": "TeacherPass123!"}'

# Coordinator
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "coordinator@kompi-cyber.local", "password": "CoordinatorPass123!"}'

# Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@kompi-cyber.local", "password": "AdminPass123!"}'
```

---

## 🔄 How to Use Tokens

1. **Login** and get token:

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@kompi-cyber.local", "password": "TeacherPass123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo $TOKEN
```

2. **Use token in requests**:

```bash
curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚨 Security Notes

- ⚠️ These are **development test accounts** only
- ⚠️ Delete before production deployment
- ⚠️ Never commit real passwords to git
- ⚠️ Use `.env` for production credentials
- ⚠️ Passwords follow strong policy: 8+ chars, uppercase, lowercase, number, special char

---

## 📦 Setting Up Test Accounts in Database

If accounts don't exist, create them:

```sql
-- Insert roles (if not exist)
INSERT IGNORE INTO roles (id, name) VALUES
(1, 'student'),
(2, 'instructor'),
(3, 'admin'),
(4, 'coordinator');

-- Insert test accounts (passwords are bcrypt hashed - use the registration endpoint instead)
-- Use the API to register or update userModel.createUser() directly
```

Better approach - use registration endpoint with test script:

```bash
# Register student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@kompi-cyber.local",
    "password": "StudentPass123!"
  }'

# Then manually set roleId = 1 in database
```

---

## 🧪 Test Scenarios

### Scenario 1: Teacher Course Cloning

```
1. Login as teacher@kompi-cyber.local (Password: TeacherPass123!)
2. Get token from response
3. POST /api/courses/1/clone with token
4. Verify roleId=2 in response
```

### Scenario 2: Coordinator vs Teacher Distinction

```
1. Login as teacher@kompi-cyber.local → roleId=2
2. Login as coordinator@kompi-cyber.local → roleId=4
3. Both can create courses, but POST /api/coordinator-only route:
   - Teacher (2): Access denied
   - Coordinator (4): Access allowed
```

### Scenario 3: Student Accepting Invitation

```
1. Login as teacher → send invitation to student@kompi-cyber.local
2. Login as student@kompi-cyber.local (StudentPass123!)
3. GET /api/invitations
4. POST /api/invitations/{id}/accept
5. GET /api/progress/my-progress/{courseId} → should show enrolled
```

---

    -`/backend/middleware/authMiddleware.js` - Role-based access control

- `/backend/routes/authRoutes.js` - Authentication endpoints

---

**Created**: April 3, 2026
**Status**: Development/Testing
