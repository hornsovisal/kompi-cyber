# Role-Based Access Control (RBAC) Flow

## Roles Overview

```
┌─────────────────────────────────────────────────────┐
│           Kompi-Cyber Role Hierarchy                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Role ID 1: STUDENT                                 │
│  ├─ Can: Enroll, View courses, Submit work         │
│  ├─ Cannot: Create courses, Grade, Manage users    │
│  └─ Endpoints: /progress/my-progress, /invitations │
│                                                     │
│  Role ID 2: TEACHER / INSTRUCTOR                   │
│  ├─ Can: Create courses, Invite students, Grade    │
│  ├─ Can: Clone courses, View student progress      │
│  ├─ Cannot: Access admin panel                     │
│  └─ Endpoints: /courses/:id/clone, /invitations/   │
│                                                     │
│  Role ID 3: ADMIN                                   │
│  ├─ Can: Everything                                 │
│  ├─ Can: Manage users, System config               │
│  └─ Endpoints: All endpoints                       │
│                                                     │
│  Role ID 4: COORDINATOR                            │
│  ├─ Can: Design curriculum, Manage courses         │
│  ├─ Can: Same as Teacher                           │
│  ├─ Cannot: Access admin panel                     │
│  └─ Endpoints: /courses, /progress                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Authorization Middleware Checks

### 1. requireInstructor (allows 2 OR 3)

```javascript
┌─────────────────────────┐
│   User Request          │
├─────────────────────────┤
│ Check roleId            │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
roleId=2   roleId=3    roleId=1    roleId=4
(Teacher)  (Admin)     (Student)   (Coordinator)
   ✅        ✅          ❌          ❌
   │         │
   └────┬────┘
        │
        ▼
   Allow Request
```

**Used in**: Course cloning, Progress viewing, Invitations

```javascript
router.post("/courses/:id/clone", authMiddleware.requireInstructor, controller);
```

---

### 2. requireCoordinator (allows 2 OR 3 OR 4)

```javascript
┌─────────────────────────┐
│   User Request          │
├─────────────────────────┤
│ Check roleId            │
└────────┬────────────────┘
         │
    ┌────┴────────┐
    │             │
    ▼             ▼
roleId=2,3,4  roleId=1
(Instructor,  (Student)
 Coordinator,
 Admin)
   ✅          ❌
   │
   ▼
Allow Request
```

**Used in**: Curriculum design, Course management

```javascript
router.post("/curriculum", authMiddleware.requireCoordinator, controller);
```

---

### 3. requireTeacherOnly (allows ONLY 2)

```javascript
┌─────────────────────────────┐
│   User Request              │
├─────────────────────────────┤
│ Check if roleId === 2       │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
roleId=2    Other Roles
(Teacher)   (1,3,4)
   ✅         ❌
   │
   ▼
Allow Request
```

**Used in**: Teacher-specific features

```javascript
router.post("/teacher-action", authMiddleware.requireTeacherOnly, controller);
```

---

### 4. requireCoordinatorOnly (allows ONLY 4)

```javascript
┌─────────────────────────────┐
│   User Request              │
├─────────────────────────────┤
│ Check if roleId === 4       │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
roleId=4    Other Roles
(Coordinator) (1,2,3)
   ✅         ❌
   │
   ▼
Allow Request
```

**Used in**: Coordinator-specific features

```javascript
router.post(
  "/design-curriculum",
  authMiddleware.requireCoordinatorOnly,
  controller,
);
```

---

### 5. requireAdmin (allows ONLY 3)

```javascript
┌─────────────────────────────┐
│   User Request              │
├─────────────────────────────┤
│ Check if roleId === 3       │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
roleId=3    Other Roles
(Admin)     (1,2,4)
   ✅         ❌
   │
   ▼
Allow Request
```

**Used in**: System management, User management

```javascript
router.delete("/users/:id", authMiddleware.requireAdmin, controller);
```

---

## Login & Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. POST /api/auth/login                             │
│    { email, password }                              │
└────────────────┬──────────────────────────────────┐
                 │                                  │
                 ▼                                  ▼
         ✅ Valid Creds                    ❌ Invalid Creds
         Hash Password                     Return 401
         Find User in DB
         Check Role ID
                 │
                 ▼
      ┌──────────────────────┐
      │ Generate JWT Token   │
      │ Payload:             │
      │ - sub (user id)      │
      │ - email              │
      │ - roleId ← KEY       │
      │ - exp (1 hour)       │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Return JSON:         │
      │ {                    │
      │   token: "...",      │
      │   user: {            │
      │     roleId: 2,  ◄────┼─ CRITICAL
      │     email: "..."     │
      │   }                  │
      │ }                    │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Client stores token  │
      │ in Authorization     │
      │ header for requests  │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Each request checked │
      │ by middleware using  │
      │ roleId from token    │
      └──────────────────────┘
```

---

## Request Authorization Check

```
┌────────────────────────────────────────────────────┐
│ Incoming Request with Token                        │
│ Authorization: Bearer eyJhbGc...                   │
└────────────┬─────────────────────────────────────┐
             │
             ▼
  ┌──────────────────────┐
  │ Extract JWT Token    │
  │ from header          │
  └────────┬─────────────┘
           │
           ▼
  ┌──────────────────────┐
  │ Verify JWT Signature │
  │ Check expiration     │
  └────────┬─────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
Valid Token   Invalid Token
    │             │
    ▼             ▼
Decode JWT    Return 401
Extract roleId Unauthorized
    │
    ▼
┌──────────────────────┐
│ Check Route's        │
│ Middleware           │
│ requireTeacherOnly?  │
└────────┬─────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
roleId=2   Other
 (✅)      (❌)
    │         │
    └────┬────┘
         │
         ▼
    Allow/Deny
    Proceed/403
```

---

## Test Sequence Diagram

```
┌─────────┐            ┌──────────────┐           ┌───────────────┐
│ Browser │            │ Backend API  │           │   Database    │
└────┬────┘            └──────┬───────┘           └───────┬───────┘
     │                        │                           │
     │ POST /auth/login       │                           │
     │ {email, password}      │                           │
     ├───────────────────────►│                           │
     │                        │ SELECT * FROM users WHERE │
     │                        │ email = "teacher@..."     │
     │                        ├──────────────────────────►│
     │                        │                           │
     │                        │ rows: [{id, role_id:2}]   │
     │                        │◄──────────────────────────┤
     │                        │                           │
     │                        │ Verify bcrypt password    │
     │                        │ ✅ Match                  │
     │                        │                           │
     │                        │ signToken({              │
     │                        │   roleId: 2,  ◄──KEY─┐   │
     │                        │   email: "...",      │   │
     │                        │   sub: "uuid"        │   │
     │                        │ })                   │   │
     │                        │                      │   │
     │◄───────────────────────┤ JWT Token sent       │   │
     │ {token, roleId:2}      │                      │   │
     │                        │                      │   │
     │ Store Token            │                      │   │
     │ Authorization: Bearer  │                      │   │
     │                        │                      │   │
     │ POST /courses/1/clone  │                      │   │
     │ Headers: {             │                      │   │
     │   Authorization: token │                      │   │
     │ }                      │                      │   │
     ├───────────────────────►│                      │   │
     │                        │ Decode JWT           │   │
     │                        │ Extract roleId: 2    │   │
     │                        │                      │   │
     │                        │ Check requireTeacher │   │
     │                        │ roleId === 2? YES ✅ │   │
     │                        │                      │   │
     │                        │ Call controller...   │   │
     │                        ├──────────────────────────►
     │                        │                           │
     │◄───────────────────────┤ Clone successful          │
     │ {newCourseId}          │◄──────────────────────────┤
     │                        │                           │
```

---

## Endpoint Matrix - Who Can Access What?

| Endpoint                                 | Student (1) | Teacher (2) | Admin (3) | Coordinator (4) |
| ---------------------------------------- | :---------: | :---------: | :-------: | :-------------: |
| GET /courses                             |     ✅      |     ✅      |    ✅     |       ✅        |
| GET /courses/:id/lessons                 |     ✅      |     ✅      |    ✅     |       ✅        |
| POST /courses                            |     ❌      |     ❌      |    ✅     |       ✅        |
| POST /courses/:id/clone                  |     ❌      |     ✅      |    ✅     |       ✅        |
| PUT /courses/:id                         |     ❌      |     ❌      |    ✅     |       ❌        |
| DELETE /courses/:id                      |     ❌      |     ❌      |    ✅     |       ❌        |
| POST /invitations/send                   |     ❌      |     ✅      |    ✅     |       ✅        |
| GET /invitations                         |     ✅      |     ❌      |    ❌     |       ❌        |
| POST /invitations/:id/accept             |     ✅      |     ❌      |    ❌     |       ❌        |
| GET /progress/my-progress/:cid           |     ✅      |     ❌      |    ❌     |       ❌        |
| GET /progress/courses/:id                |     ❌      |     ✅      |    ✅     |       ✅        |
| GET /progress/courses/:cid/students/:sid |     ❌      |     ✅      |    ✅     |       ✅        |

---

## Code Example: Using Middleware

```javascript
// teacher-only-routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// This route is ONLY for teachers (roleId = 2)
router.post(
  "/design-lesson",
  authMiddleware.authenticateToken, // Step 1: Verify JWT
  authMiddleware.requireTeacherOnly, // Step 2: Check roleId === 2
  controller.designLesson, // Step 3: Execute action
);

// This route is for coordinators and teachers
router.post(
  "/manage-course",
  authMiddleware.authenticateToken, // Step 1: Verify JWT
  authMiddleware.requireCoordinator, // Step 2: Check roleId = 2,3,4
  controller.manageCourse, // Step 3: Execute action
);

module.exports = router;
```

---

## Error Responses

### ❌ Missing Token

```
Status: 401 Unauthorized
{
  "message": "Unauthorized",
  "error": "No token provided"
}
```

### ❌ Invalid Token

```
Status: 401 Unauthorized
{
  "message": "Invalid or expired token"
}
```

### ❌ Insufficient Permissions (Teacher tries Coordinator-only)

```
Status: 403 Forbidden
{
  "message": "Coordinator access required (roleId=4)",
  "roleId": 2,
  "email": "teacher@kompi-cyber.local"
}
```

---

## Summary Table

| Middleware               | Allows     | Denies | Use Case                      |
| ------------------------ | ---------- | ------ | ----------------------------- |
| `requireTeacherOnly`     | Role 2     | 1,3,4  | Teacher-specific features     |
| `requireCoordinatorOnly` | Role 4     | 1,2,3  | Coordinator curriculum design |
| `requireInstructor`      | Role 2,3   | 1,4    | Course management             |
| `requireCoordinator`     | Role 2,3,4 | 1      | General instructor features   |
| `requireAdmin`           | Role 3     | 1,2,4  | System-wide admin functions   |
| `requireStudent`         | Role 1     | 2,3,4  | Student-only features         |

---

**Last Updated**: April 3, 2026
