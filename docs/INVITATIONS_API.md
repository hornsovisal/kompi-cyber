# Course Invitations API

This API allows teachers to invite students to courses by email, and students to accept or reject invitations.

## Endpoints

### 1. Send Invitation (Teacher)

**POST** `/api/invitations/send`

Allow a teacher to send an invitation to a student (by email).

#### Request Body

```json
{
  "courseId": 1,
  "studentEmail": "student@example.com"
}
```

#### Response

```json
{
  "success": true,
  "message": "Invitation sent to student@example.com"
}
```

#### Errors

- **400**: Missing courseId or studentEmail, or invitation already exists
- **403**: Not the course teacher
- **500**: Server error

---

### 2. Get Student's Invitations

**GET** `/api/invitations`

Get all pending and responded invitations for the current student.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "teacher_id": "uuid-teacher-123",
      "student_email": "student@example.com",
      "status": "pending",
      "invited_at": "2026-03-28 10:00:00",
      "course_title": "Introduction to Cybersecurity",
      "course_description": "...",
      "teacher_name": "Aisha Instructor"
    }
  ]
}
```

#### Errors

- **500**: Server error

---

### 3. Accept Invitation

**POST** `/api/invitations/:id/accept`

Student accepts an invitation and is automatically enrolled in the course.

#### Response

```json
{
  "success": true,
  "message": "Invitation accepted! You are now enrolled in the course",
  "courseId": 1
}
```

#### Errors

- **404**: Invitation not found
- **403**: Invitation is not for this student's email
- **400**: Invitation already accepted/rejected
- **500**: Server error

---

### 4. Reject Invitation

**POST** `/api/invitations/:id/reject`

Student rejects an invitation.

#### Response

```json
{
  "success": true,
  "message": "Invitation rejected"
}
```

#### Errors

- **404**: Invitation not found
- **403**: Invitation is not for this student's email
- **400**: Invitation already accepted/rejected
- **500**: Server error

---

### 5. Get Course Invitations (Teacher)

**GET** `/api/invitations/course/:courseId`

Teacher views all invitations they sent for a specific course.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "teacher_id": "uuid-teacher-123",
      "student_email": "student@example.com",
      "status": "pending",
      "invited_at": "2026-03-28 10:00:00",
      "responded_at": null,
      "student_name": "Not registered yet"
    },
    {
      "id": 2,
      "course_id": 1,
      "teacher_id": "uuid-teacher-123",
      "student_email": "nimal@example.com",
      "status": "accepted",
      "invited_at": "2026-03-28 09:00:00",
      "responded_at": "2026-03-28 10:30:00",
      "student_name": "Nimal Student"
    }
  ]
}
```

#### Errors

- **403**: Not the course teacher
- **500**: Server error

---

### 6. Cancel Invitation (Teacher)

**DELETE** `/api/invitations/:id`

Teacher cancels a pending invitation.

#### Response

```json
{
  "success": true,
  "message": "Invitation cancelled"
}
```

#### Errors

- **404**: Invitation not found or already responded
- **500**: Server error

---

### 7. Resend Invitation (Teacher)

**POST** `/api/invitations/:id/resend`

Teacher resends a pending invitation (updates the invited_at timestamp).

#### Response

```json
{
  "success": true,
  "message": "Invitation resent"
}
```

#### Errors

- **404**: Invitation not found or already responded
- **500**: Server error

---

## Database Schema

```sql
CREATE TABLE `course_invitations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `teacher_id` CHAR(36) NOT NULL,
  `student_email` VARCHAR(150) NOT NULL,
  `status` ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `invited_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` TIMESTAMP NULL DEFAULT NULL,
  `student_id` CHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invitations_course_email` (`course_id`, `student_email`),
  KEY `idx_invitations_teacher_id` (`teacher_id`),
  KEY `idx_invitations_student_email` (`student_email`),
  KEY `idx_invitations_status` (`status`),
  CONSTRAINT `fk_invitations_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invitations_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invitations_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);
```

## Workflow Examples

### Teacher Inviting a Student

1. Teacher calls `POST /api/invitations/send` with courseId and studentEmail
2. Invitation is created with status='pending'
3. System should send email notification (future enhancement)

### Student Accepting Invitation

1. Student calls `GET /api/invitations` to see pending invitations
2. Student calls `POST /api/invitations/:id/accept`
3. Invitation status changes to 'accepted'
4. Student is automatically enrolled in the course
5. Student can now access course content

### Teacher Managing Invitations

1. Teacher calls `GET /api/invitations/course/:courseId` to see all invites for a course
2. Teacher can `DELETE /api/invitations/:id` to cancel pending invites
3. Teacher can `POST /api/invitations/:id/resend` to remind students

## Authentication

All endpoints require authentication via JWT token in Authorization header:

```
Authorization: Bearer <jwt-token>
```

The authenticated user's role determines permissions:

- **,**Notes
- Invitations are unique per course and email address (cannot send duplicate pending invitations)
- When a student accepts an invitation, they are automatically enrolled in the course
- The system handles the case where a student might already be enrolled (no error on duplicate enrollment)
- Invitations can only be cancelled if they're still pending
- Once accepted/rejected, invitations cannot be changed
