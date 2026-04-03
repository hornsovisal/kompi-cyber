# 📚 Login & Role Documentation - Complete Reference

## What You Have Now

You have a complete **instructor/coordinator login system** with:

✅ **4 Roles** - Student, Teacher, Coordinator, Admin  
✅ **Email-Based Role Detection** - Identify account type  
✅ **JWT Token Authorization** - Secure access control  
✅ **Role Enforcement Middleware** - Automatic permission checking  
✅ **Complete Documentation** - Everything you need  

---

## 📖 Documentation Files Created

| File | Content | Purpose |
|------|---------|---------|
| **LOGIN_GUIDE.md** | Complete login reference | START HERE ⭐ |
| **QUICK_LOGIN.md** | Fast copy-paste commands | Quick reference |
| **TEST_ACCOUNTS.md** | All account passwords | Account details |
| **RBAC_FLOWCHART.md** | Visual diagrams | Understand flows |
| **emailRoleMiddleware.js** | Code for role detection | Backend implementation |

---

## 🔐 Instant Login References

### Teacher Login
```
Email:    teacher@kompi-cyber.local
Password: TeacherPass123!
Role ID:  2
```

**Copy-paste curl**:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"teacher@kompi-cyber.local","password":"TeacherPass123!"}'
```

### Coordinator Login
```
Email:    coordinator@kompi-cyber.local
Password: CoordinatorPass123!
Role ID:  4
```

**Copy-paste curl**:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"coordinator@kompi-cyber.local","password":"CoordinatorPass123!"}'
```

### Student Login
```
Email:    student@kompi-cyber.local
Password: StudentPass123!
Role ID:  1
```

**Copy-paste curl**:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"student@kompi-cyber.local","password":"StudentPass123!"}'
```

### Admin Login
```
Email:    admin@kompi-cyber.local
Password: AdminPass123!
Role ID:  3
```

**Copy-paste curl**:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@kompi-cyber.local","password":"AdminPass123!"}'
```

---

## 🎯 How Middleware Differentiates

### Teacher vs Coordinator
The system checks **roleId** in JWT token:

```javascript
// Teacher Only (roleId = 2)
router.post("/teacher-route", 
  authMiddleware.requireTeacherOnly,  ← Blocks roles 1,3,4
  controller
);

// Coordinator Only (roleId = 4)
router.post("/coordinator-route", 
  authMiddleware.requireCoordinatorOnly,  ← Blocks roles 1,2,3
  controller
);
```

### How It Works
1. User logs in → Email matched to role → JWT token created with roleId
2. Request made → Middleware extracts roleId from token
3. Middleware checks: Is roleId === 2 (for teacher-only)?
4. Yes → Allow ✅ | No → Deny 403 ❌

---

## 📋 All Passwords Quick Table

```
Role         Email                      Password              Copy-Paste Ready
─────────────────────────────────────────────────────────────────────────────
Student      student@kompi-cyber.local  StudentPass123!       [See QUICK_LOGIN.md]
Teacher      teacher@kompi-cyber.local  TeacherPass123!       [See QUICK_LOGIN.md]
Coordinator  coordinator@kompi-cyber.local CoordinatorPass123! [See QUICK_LOGIN.md]
Admin        admin@kompi-cyber.local    AdminPass123!         [See QUICK_LOGIN.md]
```

---

## 🔄 Token Usage

### Get Token
```bash
# Login request returns token in response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Use Token in Requests
```bash
# Add to every request that needs authentication
curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer $TOKEN"
```

### Token Contents
```json
{
  "sub": "user-id-uuid",
  "email": "teacher@kompi-cyber.local",
  "roleId": 2,     ← THIS IS WHAT GETS CHECKED
  "iat": 1712177280,
  "exp": 1712180880  ← Expires in 1 hour
}
```

---

## ✅ What Each Role Can Do

### Student (Role 1)
- ✅ Browse courses
- ✅ Enroll in courses
- ✅ View own progress
- ✅ Accept invitations
- ❌ Create courses
- ❌ Invite students
- ❌ Grade assignments

### Teacher (Role 2)
- ✅ Create courses
- ✅ Clone courses
- ✅ Invite students
- ✅ View all students' progress
- ✅ Grade assignments
- ❌ Access admin panel
- ❌ Manage system users

### Coordinator (Role 4)
- ✅ Design curriculum
- ✅ Create courses
- ✅ Clone courses
- ✅ Invite students
- ✅ Coordinate courses
- ❌ Access admin panel
- ❌ Manage system users

### Admin (Role 3)
- ✅ Everything
- ✅ Manage users
- ✅ System configuration
- ✅ View all data
- ✅ System-wide access

---

## 📂 Key Backend Files

**Middleware** (Authorization Logic):
- `/backend/middleware/authMiddleware.js` - Role checking
- `/backend/middleware/emailRoleMiddleware.js` - **NEW** - Email detection

**Controllers** (Business Logic):
- `/backend/controller/authController.js` - Login logic

**Routes** (Endpoints):
- `/backend/routes/authRoutes.js` - Login endpoints

**Models** (Database):
- `/backend/models/userModel.js` - User queries

---

## 🧪 Quick Testing

### Test 1: Login as Teacher
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@kompi-cyber.local","password":"TeacherPass123!"}'

# Should return:
# {
#   "user": { "roleId": 2, ... },
#   "token": "eyJhbG..."
# }
```

### Test 2: Use Token to Clone Course
```bash
# Get token first (from test 1)
TOKEN="<paste token here>"

# Clone course (requires teacher role)
curl -X POST http://localhost:5000/api/courses/1/clone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titleSuffix":"(Q2 2026)"}'

# ✅ Should succeed
```

### Test 3: Student Tries to Clone (Should Fail)
```bash
# Get student token first
STUDENT_TOKEN="<student token>"

# Try to clone (student role 1, not allowed)
curl -X POST http://localhost:5000/api/courses/1/clone \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# ❌ Should return 403 Forbidden
# "Instructor or admin access required"
```

---

## 🔗 Related Files

```
Project Root
├── LOGIN_GUIDE.md (⭐ START HERE)
├── QUICK_LOGIN.md (Quick reference)
├── TEST_ACCOUNTS.md (All passwords)
├── RBAC_FLOWCHART.md (Flow diagrams)
├── IMPLEMENTATION_GUIDE.md (Full tech docs)
└── backend/
    ├── middleware/
    │   ├── authMiddleware.js (Role checks)
    │   └── emailRoleMiddleware.js (NEW - Email detection)
    ├── controller/
    │   └── authController.js
    └── routes/
        └── authRoutes.js
```

---

## 📝 How Emails Work

The system maps email domains to roles:

| Email Contains | Default Role |
|---|---|
| `teacher@` | Role 2 (Teacher) |
| `coordinator@` | Role 4 (Coordinator) |
| `student@` | Role 1 (Student) |
| `admin@` | Role 3 (Admin) |

---

## 🚀 Next Steps

1. **Read LOGIN_GUIDE.md** ← Complete guide
2. **Try logging in** ← Use copy-paste commands above
3. **Test role checking** ← Run the test scenarios
4. **Read RBAC_FLOWCHART.md** ← Understand the diagrams
5. **Check authMiddleware.js** ← See the actual code

---

## ❓ Common Questions

**Q: How does the system know if an email is teacher or coordinator?**  
A: The email domain tells it (`teacher@` vs `coordinator@`). Or check in database user's role_id field.

**Q: Can a teacher access coordinator endpoints?**  
A: Only if the endpoint allows both (requires coordinator). Teacher-specific endpoints will block coordinators.

**Q: How long does a token last?**  
A: 1 hour. After that, user needs to login again.

**Q: What if I mess up the password?**  
A: It returns 401 "Invalid email or password". Try again. All test passwords are listed above.

**Q: How do I check what role a user has?**  
A: Login → Check response `roleId` field. Or check in database users table.

---

## 📊 Architecture Summary

```
Login Request
    ↓
Validate Email + Password
    ↓
Find User in Database
    ↓
Extract roleId (2 for teacher, 4 for coordinator)
    ↓
Create JWT with roleId inside
    ↓
Send Token to Client
    ↓
Client uses Token in requests:
    Authorization: Bearer <token>
    ↓
Server checks roleId in token
    ↓
Middleware checks permission:
  - requireTeacherOnly? roleId must = 2
  - requireCoordinator? roleId must = 4
  - requireInstructor? roleId must = 2 or 3
    ↓
Allow or Deny Access
```

---

## 🎯 Bottom Line

✅ **To login as teacher**: Use `teacher@kompi-cyber.local` + `TeacherPass123!`  
✅ **To login as coordinator**: Use `coordinator@kompi-cyber.local` + `CoordinatorPass123!`  
✅ **Middleware automatically checks** roleId from JWT token  
✅ **All passwords are documented** in TEST_ACCOUNTS.md  
✅ **Complete guides available** - Read LOGIN_GUIDE.md

---

**Last Updated**: April 3, 2026  
**Status**: ✅ Ready to Use

Start with: **[LOGIN_GUIDE.md](./LOGIN_GUIDE.md)** ⭐
