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

## 3) Lesson + Exercise APIs

All routes below require JWT.

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

---

## Notes for current backend behavior

- `GET /api/users/:id` is accessible to any authenticated user.
- `PUT /api/users/:id` only works for the same user ID as token `sub`.
- User object returned to frontend is sanitized by `toSafeUser()` (no password hash).
