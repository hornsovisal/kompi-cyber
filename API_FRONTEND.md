# Frontend API Documentation

Base URL: `http://localhost:5000`

## Authentication

Most endpoints require JWT:

- Header: `Authorization: Bearer <token>`
- Token is returned from `POST /api/auth/login`

---

## Role Mapping

From database `roles` seed:

- `1` = student
- `2` = instructor
- `3` = admin

Admin-only endpoints require `roleId = 3` in JWT.

---

## Standard Error Responses

Common errors:

- `400` Bad request (invalid payload/params)
- `401` Unauthorized (missing/invalid/expired token)
- `403` Forbidden (no permission)
- `404` Not found
- `409` Conflict (duplicate email)
- `500` Server error

Body format:

```json
{ "message": "..." }
```

---

## 1) Auth APIs

### POST `/api/auth/register`

Register new user.

#### Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

#### Success `201`

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Errors

- `400` if missing fields
- `409` if email already exists

---

### POST `/api/auth/login`

Login and get JWT.

#### Body

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

#### Success `200`

```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "roleId": 1,
    "isActive": true,
    "createdAt": "2026-03-12T00:00:00.000Z",
    "updatedAt": "2026-03-12T00:00:00.000Z"
  }
}
```

#### Errors

- `400` missing email/password
- `401` invalid credentials

---

## 2) User APIs

All routes below require JWT.

### GET `/api/users/me`

Get current logged-in profile.

#### Success `200`

```json
{
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "roleId": 1,
    "roleName": "student",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PUT `/api/users/me`

Update own profile.

#### Body

```json
{
  "full_name": "New Name",
  "email": "new@example.com"
}
```

#### Success `200`

```json
{
  "message": "Profile updated successfully",
  "user": { "...": "safe user" }
}
```

#### Error

- `400` if no valid fields (`full_name`, `email`)

---

### GET `/api/users/:id`

Get user by ID.

#### Success `200`

```json
{
  "user": { "...": "safe user" }
}
```

---

### PUT `/api/users/:id`

Update user by ID (currently only if `:id` equals current token `sub`).

#### Body

```json
{
  "full_name": "New Name",
  "email": "new@example.com"
}
```

#### Success `200`

```json
{
  "message": "User updated successfully",
  "user": { "...": "safe user" }
}
```

#### Errors

- `403` if trying to update another user
- `400` no valid fields

---

### GET `/api/users/:id/progress`

Get lesson progress list for user.

#### Success `200`

```json
{
  "userId": "uuid",
  "progress": [
    {
      "lesson_id": 1,
      "lesson_title": "Intro",
      "status": "completed",
      "completed_at": "2026-03-12T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/users`

Admin only. List users.

#### Success `200`

```json
{
  "users": [
    {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "roleId": 1,
      "roleName": "student",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### Errors

- `403` admin access required

---

### PATCH `/api/users/:id/status`

Admin only. Activate/deactivate user.

#### Body (option A)

```json
{ "is_active": true }
```

#### Body (option B)

```json
{ "is_active": 1 }
```

#### Body (option C)

```json
{ "status": "active" }
```

Valid status values: `active`, `inactive`.

#### Success `200`

```json
{
  "message": "User status updated successfully",
  "user": { "...": "safe user" }
}
```

#### Errors

- `400` invalid status payload
- `403` admin only
- `404` user not found

---

### PATCH `/api/users/:id/role`

Admin only. Change user role.

#### Body

```json
{ "role_id": 2 }
```

Also accepted:

```json
{ "roleId": 2 }
```

#### Success `200`

```json
{
  "message": "User role updated successfully",
  "user": { "...": "safe user" }
}
```

#### Errors

- `400` invalid role id / role does not exist
- `403` admin only
- `404` user not found

---

## 3) Enrollment APIs

All routes below require JWT.

### POST `/api/enrollments`

Enroll the current user in a course. One enrollment per user per course — re-enrolling returns `200` instead of creating a duplicate.

#### Body

```json
{
  "course_id": 1
}
```

#### Success `201` (new enrollment)

```json
{
  "message": "Enrolled successfully",
  "enrolled": true
}
```

#### Success `200` (already enrolled)

```json
{
  "message": "Already enrolled",
  "enrolled": true
}
```

#### Errors

- `400` invalid / missing `course_id`
- `404` course not found

---

### GET `/api/enrollments/my`

Get all courses the current user is enrolled in.

#### Success `200`

```json
{
  "enrollments": [
    {
      "id": 1,
      "course_id": 2,
      "enrolled_at": "2026-03-12T00:00:00.000Z",
      "title": "Intro to Cybersecurity",
      "description": "...",
      "level": "beginner",
      "duration_hrs": 5
    }
  ]
}
```

---

### GET `/api/enrollments/check/:courseId`

Check whether the current user is enrolled in a specific course.

#### Success `200`

```json
{ "enrolled": true }
```

or

```json
{ "enrolled": false }
```

#### Errors

- `400` invalid courseId

---

### DELETE `/api/enrollments/:courseId`

Unenroll the current user from a course.

#### Success `200`

```json
{ "message": "Unenrolled successfully" }
```

#### Errors

- `400` invalid courseId

---

## 4) Course APIs

All routes below require JWT.

### GET `/api/courses`

Get all courses.

#### Success `200`

```json
{
  "courses": [
    {
      "id": 1,
      "title": "Intro to Cybersecurity",
      "description": "...",
      "level": "beginner",
      "duration_hrs": 5
    }
  ]
}
```

---

### GET `/api/courses/:id`

Get one course by ID.

#### Success `200`

```json
{
  "course": {
    "id": 1,
    "title": "Intro to Cybersecurity",
    "description": "...",
    "level": "beginner",
    "duration_hrs": 5
  }
}
```

#### Errors

- `400` invalid course id
- `404` course not found

---

### GET `/api/courses/:courseId/lessons`

Get all lessons in one course.

#### Success `200`

```json
{
  "courseId": 1,
  "lessons": [
    {
      "id": 1,
      "module_id": 1,
      "module_title": "Module 1",
      "module_order": 1,
      "course_id": 1,
      "title": "Lesson title",
      "content_md": "...",
      "lesson_order": 1
    }
  ]
}
```

#### Errors

- `400` invalid courseId
- `404` course not found
- `403` not enrolled in the course

Example `403` body:

```json
{
  "message": "You must enroll in this course to access its lessons",
  "enrolled": false
}
```

---

### POST `/api/courses`

Admin only. Create a new course.

#### Body

```json
{
  "domain_id": 1,
  "title": "SOC Analyst Fundamentals",
  "description": "Blue team basics",
  "level": "beginner",
  "duration_hrs": 8,
  "is_published": 1
}
```

Required: `domain_id`, `title`

#### Success `201`

```json
{
  "message": "Course created successfully",
  "course": { "...": "created course" }
}
```

#### Errors

- `400` invalid payload
- `403` admin access required

---

### PUT `/api/courses/:id`

Admin only. Update a course.

#### Body

Any subset of:

- `domain_id`
- `title`
- `description`
- `level` (`beginner|intermediate|advanced`)
- `duration_hrs`
- `is_published`

#### Success `200`

```json
{
  "message": "Course updated successfully",
  "course": { "...": "updated course" }
}
```

#### Errors

- `400` invalid course id or no valid fields
- `403` admin access required
- `404` course not found

---

### DELETE `/api/courses/:id`

Admin only. Delete a course.

#### Success `200`

```json
{ "message": "Course deleted successfully" }
```

#### Errors

- `400` invalid course id
- `403` admin access required
- `404` course not found

---

## 5) Lesson + Exercise APIs

All routes below require JWT.

> **Enrollment required**: Read endpoints (`GET /api/lessons/:id`, `GET /api/lessons/:lessonId/exercises`, `GET /api/exercises/:id`) return `403` if the user is not enrolled in the course that owns the lesson. Enroll first via `POST /api/enrollments`.

### GET `/api/lessons/:lessonId/exercises`

Get exercises belonging to one lesson.

#### Success `200`

```json
{
  "lessonId": 1,
  "exercises": [
    {
      "id": 10,
      "lesson_id": 1,
      "title": "Exercise title",
      "instructions_md": "...",
      "starter_code": "...",
      "language": "python",
      "time_limit_ms": 10000,
      "memory_limit_mb": 128,
      "created_at": "..."
    }
  ]
}
```

#### Errors

- `400` invalid lessonId
- `403` not enrolled in the lesson's course

Example `403` body:

```json
{
  "message": "You must enroll in this course to access its exercises",
  "enrolled": false
}
```

---

### GET `/api/exercises/:id`

Get one exercise.

#### Success `200`

```json
{
  "exercise": {
    "id": 10,
    "lesson_id": 1,
    "title": "Exercise title",
    "instructions_md": "...",
    "starter_code": "...",
    "language": "python",
    "time_limit_ms": 10000,
    "memory_limit_mb": 128,
    "created_at": "..."
  }
}
```

#### Errors

- `400` invalid id
- `404` not found
- `403` not enrolled in the lesson's course

Example `403` body:

```json
{
  "message": "You must enroll in this course to access its exercises",
  "enrolled": false
}
```

---

### POST `/api/exercises`

Create exercise.

#### Body

```json
{
  "lesson_id": 1,
  "title": "Exercise title",
  "instructions_md": "Markdown instructions",
  "starter_code": "print('hello')",
  "language": "python",
  "time_limit_ms": 10000,
  "memory_limit_mb": 128
}
```

Required: `lesson_id`, `title`

#### Success `201`

```json
{
  "message": "Exercise created successfully",
  "exercise": { "...": "created exercise" }
}
```

---

### PUT `/api/exercises/:id`

Update exercise.

#### Body

Any subset of:

- `lesson_id`
- `title`
- `instructions_md`
- `starter_code`
- `language`
- `time_limit_ms`
- `memory_limit_mb`

Example:

```json
{
  "title": "Updated title",
  "instructions_md": "Updated instructions"
}
```

#### Success `200`

```json
{
  "message": "Exercise updated successfully",
  "exercise": { "...": "updated exercise" }
}
```

#### Errors

- `400` invalid id or no valid fields
- `404` not found

---

### DELETE `/api/exercises/:id`

Delete exercise.

#### Success `200`

```json
{
  "message": "Exercise deleted successfully"
}
```

#### Errors

- `400` invalid id
- `404` not found

---

## Frontend Implementation Checklist

1. Save `token` after login.
2. Send `Authorization` header for all protected APIs.
3. Build global interceptor for `401` to logout/redirect.
4. Show proper UI for `403` on admin-only routes.
5. Use `roleId` from user object to show/hide admin pages.
6. For profile update, use `full_name` key (not `fullName`) in request body.
7. Before showing lesson content, call `GET /api/enrollments/check/:courseId`. If `enrolled: false`, show an "Enroll" button.
8. On "Enroll" click, call `POST /api/enrollments` with `{ course_id }`. On success (`201` or `200`), proceed to load the lesson.
9. A `403` on `GET /api/lessons/:id`, `GET /api/lessons/:lessonId/exercises`, or `GET /api/exercises/:id` with `enrolled: false` in the body means the user is not enrolled. Redirect to enrollment flow.
10. Use `GET /api/enrollments/my` to display the user's enrolled courses on the dashboard.

---

## Notes for current backend behavior

- `GET /api/users/:id` is accessible to any authenticated user.
- `PUT /api/users/:id` only works for the same user ID as token `sub`.
- User object returned to frontend is sanitized by `toSafeUser()` (no password hash).
- Enrollment is **one per user per course** — enforced at both the DB level (`INSERT IGNORE`) and the controller (returns `200` instead of `409` on duplicates).
- `GET /api/lessons/:id` checks enrollment against the lesson's parent course. Returns `403` with `{ enrolled: false }` if not enrolled.
- `GET /api/lessons/:lessonId/exercises` and `GET /api/exercises/:id` also enforce enrollment and return `403` with `{ enrolled: false }` when blocked.
