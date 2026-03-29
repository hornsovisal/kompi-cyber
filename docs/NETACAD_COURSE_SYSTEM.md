# Netacad-Style Course Management System

## Overview

This system supports two types of courses, similar to Cisco NetAcad:

1. **Online-Led Courses**: Self-paced learning where students can enroll directly
2. **Instructor-Led Courses**: Structured courses where teachers invite specific students

## Database Changes

### Migration: `003_add_course_type.sql`

Added `course_type` field to the `courses` table:

- Values: `'online-led'` or `'instructor-led'`
- Default: `'online-led'`

Existing table: `course_invitations` handles teacher-student invitations

## Backend Implementation

### Course Model Updates

**File**: `backend/models/courseModel.js`

- Updated `createCourse()` to accept and store `course_type`
- Updated `updateCourse()` to allow modifying `course_type`
- Course type is included in all course queries

### Course Controller Updates

**File**: `backend/controller/courseController.js`

- Updated `createCourse()` to validate course type
- Accepts: `'online-led'` or `'instructor-led'`
- Rejects invalid types with 400 error

### Invitation Controller

**File**: `backend/controller/invitationController.js`

Existing endpoints:

```
POST   /api/invitations/send
GET    /api/invitations
POST   /api/invitations/:id/accept
POST   /api/invitations/:id/reject
GET    /api/invitations/course/:courseId
DELETE /api/invitations/:id
POST   /api/invitations/:id/resend
```

## Frontend Components

### 1. Course Type Selector

**File**: `frontend/src/components/instructor/CourseTypeSelector.jsx`

Visual selector for teachers creating courses. Features:

- Radio buttons for easy selection
- Descriptions of each type
- Benefits listed for each option

**Usage**:

```jsx
import CourseTypeSelector from "./instructor/CourseTypeSelector";

<CourseTypeSelector
  selectedType={courseType}
  onChange={(type) => setCourseType(type)}
/>;
```

### 2. Teacher Invitation Management

**File**: `frontend/src/components/instructor/InviteStudents.jsx`

Allows teachers to:

- Add student emails to invite
- Send bulk invitations to a course
- View pending invitations
- Resend invitations
- Revoke invitations

**Features**:

- Email validation
- Duplicate prevention
- Real-time status tracking
- Batch operations

**Usage**:

```jsx
import InviteStudents from "./instructor/InviteStudents";

<InviteStudents courseId={123} courseName="Ethical Hacking" />;
```

### 3. Student Invitation Management

**File**: `frontend/src/components/StudentInvitations.jsx`

Shows students:

- Pending course invitations
- Course details and teacher name
- Accept/Decline buttons
- Invitation history

**Features**:

- Automatic course enrollment on acceptance
- Invitation status tracking
- Responsive design

**Usage**:

```jsx
import StudentInvitations from "./StudentInvitations";

<StudentInvitations />;
```

## Workflow

### For Instructor-Led Courses

#### 1. Create Course

1. Instructor creates a new course
2. Selects **"Instructor-Led"** as course type
3. Course is created but hidden from public catalog

#### 2. Invite Students

1. Instructor goes to course settings
2. Opens "Invite Students" panel
3. Adds student emails
4. Sends batch invitations

#### 3. Student Receives Invitation

1. Student sees invitation in dashboard
2. Shows course title, description, teacher name
3. Can acceptance or decline

#### 4. Student Joins

1. If student accepts: Automatically enrolled in course
2. If student declines: Invitation removed
3. Can view course after enrollment

### For Online-Led Courses

1. Course is published immediately
2. Appears in public course catalog
3. Students can enroll directly without invitation
4. No teacher invitation management needed

## API Endpoints

### Create Course with Type

```http
POST /api/courses
Content-Type: application/json
Authorization: Bearer {token}

{
  "domain_id": 1,
  "title": "Advanced Ethical Hacking",
  "description": "...",
  "course_type": "instructor-led",
  "level": "advanced",
  "duration_hrs": 40,
  "is_published": 1
}
```

### Send Invitations

```http
POST /api/invitations/send
Content-Type: application/json
Authorization: Bearer {token}

{
  "courseId": 123,
  "studentEmail": "student@example.com"
}
```

### Get Student Invitations

```http
GET /api/invitations
Authorization: Bearer {token}
```

### Get Course Invitations (Teacher)

```http
GET /api/invitations/course/123
Authorization: Bearer {token}
```

### Accept Invitation

```http
POST /api/invitations/456/accept
Authorization: Bearer {token}
```

### Reject Invitation

```http
POST /api/invitations/456/reject
Authorization: Bearer {token}
```

### Resend Invitation

```http
POST /api/invitations/456/resend
Authorization: Bearer {token}
```

### Cancel/Revoke Invitation

```http
DELETE /api/invitations/456
Authorization: Bearer {token}
```

## Integration Checklist

- [ ] Run migration: `003_add_course_type.sql`
- [ ] Update existing courses to set course_type (default: 'online-led')
- [ ] Import `CourseTypeSelector` in course creation form
- [ ] Import `InviteStudents` in instructor course details page
- [ ] Import `StudentInvitations` in student dashboard
- [ ] Test teacher invitation workflow
- [ ] Test student acceptance workflow
- [ ] Test course enrollment on acceptance
- [ ] Verify course visibility based on type

## Database Schema

### Relevant Tables

#### courses

- `id` INT PRIMARY KEY
- `course_type` ENUM('online-led', 'instructor-led')
- `created_by` CHAR(36) (teacher/instructor ID)
- `is_published` TINYINT(1)

#### course_invitations

- `id` INT PRIMARY KEY
- `course_id` INT FK → courses
- `teacher_id` CHAR(36) FK → users
- `student_email` VARCHAR(150)
- `status` ENUM('pending', 'accepted', 'rejected')
- `invited_at` TIMESTAMP
- `responded_at` TIMESTAMP NULL
- `student_id` CHAR(36) FK → users (NULL until accepted)

#### enrollments

- `id` INT PRIMARY KEY
- `user_id` CHAR(36) FK → users
- `course_id` INT FK → courses
- `enrolled_at` TIMESTAMP

## Security Considerations

1. **Teachers can only invite to their courses**
   - Verified in `invitationController.sendInvitation()`

2. **Students can only accept invitations sent to their email**
   - Verified in `invitationController.acceptInvitation()`

3. **Teachers can only manage invitations for their courses**
   - Verified in `invitationController.getCourseInvitations()`

4. **Public vs Private**
   - Online-led: Always public in catalog
   - Instructor-led: Not in public catalog

## Future Enhancements

1. **Bulk Upload**: CSV import for student emails
2. **Auto-Enrollment**: Automatically enroll students from domain
3. **Rosters**: Create cohorts with predefined student groups
4. **Invitations Expiry**: Set expiration time for invitations
5. **Email Notifications**: Send actual emails to invited students
6. **Analytics**: Track invitation acceptance rates
7. **Permissions**: Different roles (TA, Guest Lecturer) for courses
8. **Waitlist**: Support for course capacity limits
