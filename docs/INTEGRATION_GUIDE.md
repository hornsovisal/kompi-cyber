# Integration Guide: Netacad-Style Course System

## Quick Start

### 1. Run Database Migration

```bash
# Connect to your database and run:
mysql -u root -p your_database < database/migrations/003_add_course_type.sql
```

### 2. Update Existing Courses (Optional)

Set `course_type` for all existing courses:

```sql
UPDATE courses SET course_type = 'online-led' WHERE course_type IS NULL;
```

### 3. Import Components Where Needed

## Frontend Integration Examples

### A. Course Creation Form

**File**: `frontend/src/pages/instructor/CreateCourse.jsx`

```jsx
import CourseTypeSelector from "../../components/instructor/CourseTypeSelector";

export default function CreateCourse() {
  const [courseType, setCourseType] = useState("online-led");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain_id: "",
    level: "beginner",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      course_type: courseType,
    };

    // Send to API
    const response = await axios.post("/api/courses", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other fields ... */}

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-bold">Course Type</h3>
        <CourseTypeSelector
          selectedType={courseType}
          onChange={setCourseType}
        />
      </div>

      {/* ... rest of form ... */}
    </form>
  );
}
```

### B. Instructor Course Settings

**File**: `frontend/src/pages/instructor/CourseSettings.jsx`

```jsx
import InviteStudents from "../../components/instructor/InviteStudents";

export default function CourseSettings({ course }) {
  return (
    <div className="space-y-8">
      {/* Basic course info */}
      <div>
        <h2>Course Information</h2>
        <p>
          Type:{" "}
          {course.course_type === "instructor-led"
            ? "👨‍🏫 Instructor-Led"
            : "📚 Online-Led"}
        </p>
      </div>

      {/* Show invite component only for instructor-led courses */}
      {course.course_type === "instructor-led" && (
        <InviteStudents courseId={course.id} courseName={course.title} />
      )}
    </div>
  );
}
```

### C. Student Dashboard

**File**: `frontend/src/pages/StudentDashboard.jsx`

```jsx
import StudentInvitations from "../components/StudentInvitations";
import {
  isInstructorLed,
  filterCoursesByType,
} from "../utils/courseTypeHelpers";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    const response = await axios.get("/api/invitations");
    setInvitations(response.data.data);
  };

  const onlineLedCourses = filterCoursesByType(courses, "online-led");
  const instructorLedCourses = filterCoursesByType(courses, "instructor-led");

  return (
    <div className="space-y-8">
      {/* Pending Invitations First */}
      <StudentInvitations />

      {/* Enrolled Courses */}
      <div>
        <h2>My Courses</h2>
        {/* Display enrolled courses */}
      </div>

      {/* Available Online-Led Courses */}
      <div>
        <h2>Explore Courses</h2>
        {onlineLedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
```

### D. Course Card with Invitation Status

```jsx
import {
  getCourseBadgeInfo,
  hasPendingInvitation,
} from "../utils/courseTypeHelpers";

export default function CourseCard({ course, studentInvitations = [] }) {
  const badge = getCourseBadgeInfo(course.course_type);
  const hasPending = hasPendingInvitation(course.id, studentInvitations);

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">{course.title}</h3>
          <span
            className={`inline-block rounded px-2 py-1 text-sm font-semibold ${badge.color}`}
          >
            {badge.icon} {badge.label}
          </span>
        </div>
      </div>

      <p className="mt-3 text-gray-600">{course.description}</p>

      <div className="mt-4">
        {hasPending && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            ⏳ Pending invitation - Check your invitations
          </div>
        )}

        {course.course_type === "online-led" ? (
          <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white">
            Enroll Now
          </button>
        ) : (
          <button
            className="mt-3 rounded-lg bg-gray-400 px-4 py-2 text-white"
            disabled
          >
            Awaiting Invitation
          </button>
        )}
      </div>
    </div>
  );
}
```

## API Usage Examples

### Frontend Requests

#### 1. Create Instructor-Led Course

```javascript
const courseData = {
  domain_id: 1,
  title: "Advanced Ethical Hacking",
  description: "Hands-on ethical hacking course",
  course_type: "instructor-led",
  level: "advanced",
  duration_hrs: 40,
  is_published: 1,
};

const response = await axios.post("/api/courses", courseData, {
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Authorization: `Bearer ${token}` },
});
```

#### 2. Invite Students

```javascript
const invitationData = {
  courseId: 123,
  studentEmail: "student@university.edu",
};

const response = await axios.post("/api/invitations/send", invitationData, {
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Authorization: `Bearer ${token}` },
});
```

#### 3. Get All Invitations for a Course

```javascript
const response = await axios.get("/api/invitations/course/123", {
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Authorization: `Bearer ${token}` },
});

const invitations = response.data.data;
// [
//   { id: 1, student_email: "student1@uni.edu", status: "pending", ... },
//   { id: 2, student_email: "student2@uni.edu", status: "accepted", ... }
// ]
```

#### 4. Get Student's Invitations

```javascript
const response = await axios.get("/api/invitations", {
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Authorization: `Bearer ${token}` },
});

const invitations = response.data.data;
// [
//   {
//     id: 456,
//     course_id: 123,
//     course_title: "Ethical Hacking",
//     teacher_name: "Dr. John Smith",
//     status: "pending",
//     invited_at: "2024-03-29T10:00:00Z"
//   }
// ]
```

#### 5. Accept Invitation

```javascript
const response = await axios.post(
  "/api/invitations/456/accept",
  {},
  {
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${token}` },
  },
);
// Student is automatically enrolled in the course
```

#### 6. Reject Invitation

```javascript
const response = await axios.post(
  "/api/invitations/456/reject",
  {},
  {
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${token}` },
  },
);
```

## Complete Integration Checklist

### Backend Setup

- [x] Add `course_type` column to `courses` table
- [x] Update `courseModel` to handle `course_type`
- [x] Update `courseController` to validate `course_type`
- [x] Verify `invitationController` endpoints
- [x] Verify `invitationRoutes` are registered

### Frontend Setup

- [ ] Import `CourseTypeSelector` in course creation
- [ ] Import `InviteStudents` in course settings (for instructor-led only)
- [ ] Import `StudentInvitations` in student dashboard
- [ ] Import helpers from `courseTypeHelpers.js`
- [ ] Update course card to show invitation status
- [ ] Add enrollment logic based on course type

### Testing

- [ ] Create online-led course → appears in catalog
- [ ] Create instructor-led course → not in public catalog
- [ ] Invite student → invitation appears in their dashboard
- [ ] Student accepts → auto-enrolled
- [ ] Student rejects → invitation removed
- [ ] Resend invitation works
- [ ] Revoke invitation works

### User Experience

- [ ] Course type clearly displayed on course cards
- [ ] Invitation notifications prominent in dashboard
- [ ] Clear instructions for teachers on invitation workflow
- [ ] Clear instructions for students on pending invitations
- [ ] Color-coded badges for course types

## Common Tasks

### Task: Show only available courses for students

```javascript
import { canEnrollDirectly } from "../utils/courseTypeHelpers";

const availableCourses = courses.filter((course) =>
  canEnrollDirectly(course, invitations),
);
```

### Task: Highlight pending invitations

```javascript
import { hasPendingInvitation } from "../utils/courseTypeHelpers";

courses.forEach((course) => {
  if (hasPendingInvitation(course.id, invitations)) {
    // Show special badge or highlighting
  }
});
```

### Task: Count enrolled vs invited courses

```javascript
const enrolledCount = courses.length;
const invitedCount = invitations.filter(
  (inv) => inv.status === "pending",
).length;
```

## Troubleshooting

### Issue: Course type not saving

**Solution**: Ensure migration was run:

```sql
ALTER TABLE courses ADD COLUMN course_type ENUM('online-led', 'instructor-led') NOT NULL DEFAULT 'online-led' AFTER duration_hrs;
```

### Issue: Invitations not showing for course

**Solution**: Check that:

1. Course exists
2. User is the course creator
3. Invitation status isn't already accepted/rejected

### Issue: Student can't accept invitation

**Solution**: Verify:

1. Invitation email matches student account email
2. Invitation status is still 'pending'
3. Student is authenticated
