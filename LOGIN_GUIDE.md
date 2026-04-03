# Complete Login & Role-Based Access Guide

## 🎯 What's New?

You now have a **complete role-based authentication system** with:

✅ **4 Distinct Roles** - Student, Teacher, Coordinator, Admin  
✅ **Role-Based Middleware** - Automatic permission checking  
✅ **Email-Based Role Detection** - Identify account type by email  
✅ **JWT Token Authorization** - Secure token-based access  
✅ **Clear Separation** - Teachers vs Coordinators handled differently  

---

## 📖 How It Works (Simplified)

### The Flow
```
User Email → Login Endpoint → JWT Token → 
Each Request → Middleware Checks Role → 
Allow or Deny Access
```

### Role Assignment
- **Email**: `teacher@kompi-cyber.local` → Role ID **2**
- **Email**: `coordinator@kompi-cyber.local` → Role ID **4**
- **Email**: `student@kompi-cyber.local` → Role ID **1**
- **Email**: `admin@kompi-cyber.local` → Role ID **3**

---

## 🔐 Login as Teacher

### Command
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@kompi-cyber.local",
    "password": "TeacherPass123!"
  }'
```

### What You Get
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Teacher Name",
    "email": "teacher@kompi-cyber.local",
    "roleId": 2,
    "isActive": true
  }
}
```

### What Teacher Can Do
- ✅ Clone courses
- ✅ Create courses
- ✅ Invite students
- ✅ View class progress
- ✅ Grade assignments
- ❌ Cannot access admin panel
- ❌ Cannot manage system users

---

## 🔐 Login as Coordinator

### Command
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordinator@kompi-cyber.local",
    "password": "CoordinatorPass123!"
  }'
```

### What You Get
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "fullName": "Coordinator Name",
    "email": "coordinator@kompi-cyber.local",
    "roleId": 4,
    "isActive": true
  }
}
```

### What Coordinator Can Do
- ✅ Design curriculum
- ✅ Create courses
- ✅ Clone courses  
- ✅ Manage multiple courses
- ✅ View progress reports
- ❌ Cannot access admin panel
- ❌ Cannot manage system users

---

## 📋 All Test Account Passwords

Copy-paste these accounts:

```
┌──────────────┬──────────────────────────┬──────────────────────┬────────┐
│ Role         │ Email                    │ Password             │ ID    │
├──────────────┼──────────────────────────┼──────────────────────┼────────┤
│ Student      │ student@kompi-cyber.local│ StudentPass123!      │ 1     │
│ Teacher      │ teacher@kompi-cyber.local│ TeacherPass123!      │ 2     │
│ Admin        │ admin@kompi-cyber.local  │ AdminPass123!        │ 3     │
│ Coordinator  │ coordinator@kompi-cyber.l│ CoordinatorPass123!  │ 4     │
└──────────────┴──────────────────────────┴──────────────────────┴────────┘
```

---

## 🛠️ How Middleware Checks Email

### Built-in Middleware

#### 1. **requireTeacherOnly**
- ✅ Allows: Role 2 (Teacher ONLY)
- ❌ Blocks: Roles 1, 3, 4

```javascript
router.post("/teacher-feature", 
  authMiddleware.requireTeacherOnly, 
  controller
);
```

#### 2. **requireCoordinatorOnly**
- ✅ Allows: Role 4 (Coordinator ONLY)
- ❌ Blocks: Roles 1, 2, 3

```javascript
router.post("/coordinator-feature", 
  authMiddleware.requireCoordinatorOnly, 
  controller
);
```

#### 3. **requireInstructor**
- ✅ Allows: Roles 2 (Teacher) + 3 (Admin)
- ❌ Blocks: Roles 1, 4

```javascript
router.post("/instructor-feature", 
  authMiddleware.requireInstructor, 
  controller
);
```

#### 4. **requireCoordinator**
- ✅ Allows: Roles 2 (Teacher) + 3 (Admin) + 4 (Coordinator)
- ❌ Blocks: Role 1

```javascript
router.post("/coord-feature", 
  authMiddleware.requireCoordinator, 
  controller
);
```

---

## 🔍 Check Email Role Type

### Get Role Info by Email

Use the new middleware to check what role an email has:

```javascript
// File: /backend/middleware/emailRoleMiddleware.js

const { getUserRoleFromEmail } = require("../middleware/emailRoleMiddleware");

// In your controller:
const roleInfo = await getUserRoleFromEmail("teacher@kompi-cyber.local");

console.log(roleInfo);
// Output:
// {
//   found: true,
//   role: "TEACHER",
//   roleId: 2,
//   name: "Teacher Name",
//   isTeacher: true,
//   isCoordinator: false,
//   isStudent: false,
//   isAdmin: false
// }
```

---

## 🚀 Common Real-World Scenarios

### Scenario 1: Teacher Wants to Clone Course
```bash
# Step 1: Teacher login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@kompi-cyber.local","password":"TeacherPass123!"}' \
  | jq -r '.token')

# Step 2: Clone course (requires role ID 2)
curl -X POST http://localhost:5000/api/courses/1/clone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titleSuffix":"(Spring 2026)"}'

# ✅ SUCCESS - Teacher (roleId=2) allowed
```

### Scenario 2: Coordinator Designs Curriculum
```bash
# Step 1: Coordinator login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinator@kompi-cyber.local","password":"CoordinatorPass123!"}' \
  | jq -r '.token')

# Step 2: Access coordinator feature
curl -X POST http://localhost:5000/api/curriculum/design \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseName":"Advanced Security"}'

# ✅ SUCCESS - Coordinator (roleId=4) allowed
```

### Scenario 3: Student Cannot Clone Courses
```bash
# Student tries to clone (will be blocked)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@kompi-cyber.local","password":"StudentPass123!"}' \
  | jq -r '.token')

curl -X POST http://localhost:5000/api/courses/1/clone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titleSuffix":"(Attempted)"}'

# ❌ ERROR 403 - Student (roleId=1) not allowed
# Response: "Instructor or admin access required"
```

---

## 📊 Permission Matrix

| Feature | Email | Password | Copy-Paste |
|---------|-------|----------|-----------|
| View as Teacher | `teacher@kompi-cyber.local` | `TeacherPass123!` | ✏️ below |
| View as Coordinator | `coordinator@kompi-cyber.local` | `CoordinatorPass123!` | ✏️ below |
| View as Student | `student@kompi-cyber.local` | `StudentPass123!` | ✏️ below |

### Copy-Paste Ready

**Teacher Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"teacher@kompi-cyber.local","password":"TeacherPass123!"}'
```

**Coordinator Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"coordinator@kompi-cyber.local","password":"CoordinatorPass123!"}'
```

**Admin Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@kompi-cyber.local","password":"AdminPass123!"}'
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `authMiddleware.js` | Role-based middleware checks |
| `emailRoleMiddleware.js` | **NEW** - Email role detection |
| `TEST_ACCOUNTS.md` | All account passwords & details |
| `QUICK_LOGIN.md` | Quick reference guide |
| `RBAC_FLOWCHART.md` | Visual authorization diagrams |

---

## ✅ Verification Checklist

Test that the system works:

- [ ] Login as teacher, get token with `roleId: 2`
- [ ] Login as coordinator, get token with `roleId: 4`
- [ ] Login as student, get token with `roleId: 1`
- [ ] Teacher can clone courses (POST `/courses/:id/clone`)
- [ ] Student cannot clone courses (gets 403 error)
- [ ] Use token in Authorization header: `Bearer TOKEN`
- [ ] Expired token returns 401 error
- [ ] Missing token returns 401 error
- [ ] Wrong role returns 403 error

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid email or password" | Check email and password match exactly (case-sensitive) |
| "Unauthorized" (401) | Missing Authorization header or token expired |
| "Instructor access required" (403) | Not a teacher/instructor (roleId ≠ 2) |
| "Coordinator access required" (403) | Not a coordinator (roleId ≠ 4) |
| Token not working | Token expires after 1 hour - re-login |

---

## 🎓 Next Steps

1. **Test logins** - Use the commands above
2. **Read QUICK_LOGIN.md** - Quick reference
3. **Read TEST_ACCOUNTS.md** - All account details
4. **Read RBAC_FLOWCHART.md** - Understand authorization flow
5. **Check authMiddleware.js** - See the code
6. **Read IMPLEMENTATION_GUIDE.md** - Full technical docs

---

**Summary**: 
- 🎯 **Teachers** (role 2) can clone, invite, grade
- 🎯 **Coordinators** (role 4) can design curriculum  
- 🎯 **Middleware** automatically checks which role via email
- 🎯 **JWT tokens** include roleId for every request
- 🎯 **Passwords** are all the same format with role in name

---

**Created**: April 3, 2026  
**Last Updated**: April 3, 2026
