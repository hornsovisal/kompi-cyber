# Quick Login Guide - Kompi-Cyber Platform

## 🎯 TL;DR - Login as Teacher or Coordinator

### Login as TEACHER (Role ID = 2)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@kompi-cyber.local",
    "password": "TeacherPass123!"
  }'
```

**Response**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiI...",
  "user": {
    "id": "uuid-12345",
    "fullName": "Teacher Name",
    "email": "teacher@kompi-cyber.local",
    "roleId": 2,
    "isActive": true
  }
}
```

**What Teacher Can Do** ✅

- Clone courses
- Invite students
- View all students' progress
- Grade assignments
- Create new courses

---

### Login as COORDINATOR (Role ID = 4)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordinator@kompi-cyber.local",
    "password": "CoordinatorPass123!"
  }'
```

**Response**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiI...",
  "user": {
    "id": "uuid-67890",
    "fullName": "Coordinator Name",
    "email": "coordinator@kompi-cyber.local",
    "roleId": 4,
    "isActive": true
  }
}
```

**What Coordinator Can Do** ✅

- Design curriculum
- Manage courses
- Same capabilities as teacher
- Coordinate between teachers

---

## 🔑 All Test Accounts

| Role            | Email                           | Password              | Role ID |
| --------------- | ------------------------------- | --------------------- | ------- |
| **Student**     | `student@kompi-cyber.local`     | `StudentPass123!`     | 1       |
| **Teacher**     | `teacher@kompi-cyber.local`     | `TeacherPass123!`     | 2       |
| **Admin**       | `admin@kompi-cyber.local`       | `AdminPass123!`       | 3       |
| **Coordinator** | `coordinator@kompi-cyber.local` | `CoordinatorPass123!` | 4       |

---

## 🔐 How Token-Based Auth Works

### Step 1️⃣: Login & Get Token

```bash
# Send email + password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@kompi-cyber.local", "password": "TeacherPass123!"}'

# Server responds with JWT token
# Response includes: token, user, roleId
```

### Step 2️⃣: Save Token

Store the token from response (usually done by frontend)

### Step 3️⃣: Use Token in Requests

```bash
# Add token to Authorization header
curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Example:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4️⃣: Server Checks Token

- Verifies token signature
- Extracts roleId from token
- Checks if user has permission for endpoint
- Returns response or 403 error

---

## 📊 Role Comparison

```
TEACHER (roleId = 2)              COORDINATOR (roleId = 4)
──────────────────────────────────────────────────────────
✅ Create courses                 ✅ Create courses
✅ Clone courses                  ✅ Clone courses
✅ Invite students                ✅ Invite students
✅ View student progress          ✅ View student progress
✅ Grade assignments              ✅ Grade assignments
❌ Access admin panel             ❌ Access admin panel
❌ Manage system users            ❌ Manage system users

Main Difference:
Teacher = Instructor role
Coordinator = Curriculum designer role
(Both have similar permissions)
```

---

## 🚀 Common Tasks

### Task 1: Teacher Cloning a Course

```bash
# 1. Login as teacher, get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@kompi-cyber.local","password":"TeacherPass123!"}' \
  | jq -r '.token')

# 2. Clone course
curl -X POST http://localhost:5000/api/courses/1/clone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titleSuffix":"(Q2 2026)"}'
```

### Task 2: Teacher Inviting Students

```bash
# Use same token from above

curl -X POST http://localhost:5000/api/invitations/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "studentEmails": ["student@kompi-cyber.local"]
  }'
```

### Task 3: Teacher Viewing Student Progress

```bash
# Use same token from above

curl http://localhost:5000/api/progress/courses/1 \
  -H "Authorization: Bearer $TOKEN"

# View specific student
curl http://localhost:5000/api/progress/courses/1/students/STUDENT_UUID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛡️ Middleware Protection

The system checks **role before allowing access**:

### Teacher-Only Routes (roleId MUST = 2)

```
POST /courses/:id/clone        ← Only teacher (2) allowed
POST /courses/:id              ← Only teacher (2) allowed
POST /invitations/send         ← Only teacher (2) allowed
```

### Coordinator-Only Routes (roleId MUST = 4)

```
POST /curriculum/design        ← Only coordinator (4) allowed
PUT /courses/:id/coordinate    ← Only coordinator (4) allowed
```

### Teacher + Coordinator Routes (roleId = 2 OR 4)

```
GET /progress/courses/:id      ← Teacher (2) or Coordinator (4)
```

### Admin-Only Routes (roleId MUST = 3)

```
DELETE /users/:id              ← Only admin (3) allowed
PUT /system/config             ← Only admin (3) allowed
```

---

## ❌ Common Errors & Solutions

### Error: "Email and password are required"

**Fix**: Check your curl command has both email and password

```bash
# Wrong ❌
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@kompi-cyber.local"}'

# Right ✅
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@kompi-cyber.local", "password": "TeacherPass123!"}'
```

### Error: "Invalid email or password"

**Fix**: Check email and password are correct

```bash
# Check the test account table above
# Make sure you're using exact password with uppercase, number, special char
```

### Error: "Unauthorized" (401)

**Fix**: You forgot the Authorization header or token is expired

```bash
# Wrong ❌
curl http://localhost:5000/api/courses

# Right ✅
curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Error: "Instructor or admin access required" (403)

**Fix**: Your account is not a teacher. Check roleId in login response

```bash
# The response shows:
{
  "user": {
    "roleId": 1  ← Student, not teacher!
  }
}

# Use teacher account instead:
"email": "teacher@kompi-cyber.local"
```

---

## 🧪 Test It Now!

### Quick Test Script

```bash
#!/bin/bash
# Save as test-login.sh

# Teacher login
echo "=== Teacher Login ==="
TEACHER=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@kompi-cyber.local","password":"TeacherPass123!"}')

echo $TEACHER | jq '.'

# Extract and show token
TOKEN=$(echo $TEACHER | jq -r '.token')
ROLE=$(echo $TEACHER | jq -r '.user.roleId')

echo ""
echo "Token: ${TOKEN:0:30}..."
echo "Role ID: $ROLE"

# Test accessing teacher-only endpoint
echo ""
echo "=== Testing Course Access ==="
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

Execute it:

```bash
chmod +x test-login.sh
./test-login.sh
```

---

## 📚 Related Documents

- [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) - All account details and usage
- [RBAC_FLOWCHART.md](./RBAC_FLOWCHART.md) - Visual authorization flowcharts
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Technical architecture
- Middleware: `/backend/middleware/authMiddleware.js`

---

**Remember**:

- ✅ Role ID 2 = Teacher
- ✅ Role ID 4 = Coordinator
- ✅ Middleware checks roleId in JWT token
- ✅ Returns 403 if insufficient permissions
- ✅ Returns 401 if no token or invalid token
