# Lecturer/Instructor Platform - Project Structure

## 👨‍💼 Developer Assignment

- **Frontend & Backend Instructor Features**: You (whitecyber)
- **All Student Features**: Team (already completed)

---

## Frontend Structure

```
frontend/src/
├── pages/
│   ├── instructor/
│   │   ├── InstructorLogin.jsx          # Instructor login page
│   │   ├── InstructorDashboard.jsx      # Main instructor dashboard
│   │   ├── CreateCourse.jsx             # Create new course
│   │   ├── EditCourse.jsx               # Edit existing course
│   │   ├── ManageCourses.jsx            # View & manage all courses
│   │   ├── CourseDetail.jsx             # Course details & settings
│   │   ├── CreateModule.jsx             # Add module to course
│   │   ├── CreateLesson.jsx             # Add lesson to module
│   │   ├── CreateQuiz.jsx               # Create quiz for lesson
│   │   ├── EditQuiz.jsx                 # Edit quiz
│   │   ├── ManageQuizzes.jsx            # View instructor's quizzes
│   │   ├── ViewResponses.jsx            # View student quiz responses
│   │   └── Analytics.jsx                # View course analytics
│   │
│   ├── Login.jsx                         # (Existing - can be reused)
│   ├── Dashboard.jsx                     # (Existing - for students)
│   ├── LearnPage.jsx                     # (Existing - for students)
│   └── ...existing pages
│
├── components/
│   ├── instructor/
│   │   ├── CourseCard.jsx               # Card for displaying course
│   │   ├── CourseForm.jsx               # Form for creating/editing courses
│   │   ├── ModuleForm.jsx               # Form for creating modules
│   │   ├── LessonForm.jsx               # Form for creating lessons
│   │   ├── QuizForm.jsx                 # Form for creating quizzes
│   │   ├── QuestionForm.jsx             # Form for quiz questions
│   │   ├── StatCard.jsx                 # Stat display card
│   │   ├── StudentResponsesList.jsx     # List of student responses
│   │   └── CourseStats.jsx              # Course statistics display
│   │
│   ├── Layout/
│   │   ├── InstructorLayout.jsx         # Layout for instructor pages
│   │   └── Sidebar.jsx                  # Sidebar navigation
│   │
│   └── ...existing components
│
├── hooks/
│   ├── useInstructor.js                 # Hook for instructor auth & data
│   ├── useCourse.js                     # Hook for course management
│   └── useQuiz.js                       # Hook for quiz management
│
└── assets/
    └── ...icons and images
```

## Backend Structure

```
backend/
├── routes/
│   ├── instructorRoutes.js              # NEW - Instructor dashboard routes
│   ├── courseManagementRoutes.js        # NEW - Course CRUD for instructors
│   ├── quizManagementRoutes.js          # NEW - Quiz management routes
│   └── ...existing routes
│
├── controller/
│   ├── instructorController.js          # NEW - Instructor dashboard logic
│   ├── courseManagementController.js    # NEW - Create/edit/delete courses
│   ├── quizManagementController.js      # NEW - Quiz creation & management
│   └── ...existing controllers
│
├── middleware/
│   ├── roleAuth.js                      # NEW - Check user role (instructor/admin)
│   ├── instructorAuth.js                # NEW - Verify instructor access
│   └── authMiddleware.js                # (Existing)
│
├── models/
│   ├── courseModel.js                   # (Existing - may need updates)
│   ├── quizModel.js                     # (Existing - may need updates)
│   ├── instructorModel.js               # NEW - Instructor-specific data
│   └── ...existing models
│
├── config/
│   └── db.js                            # (Existing)
│
└── scripts/
    └── add-lessons.js                   # (Existing)
```

## Database Schema Updates

```sql
-- Existing tables that need instructor support:
-- - users (already has role_id)
-- - courses (already has created_by)
-- - quizzes (need to add created_by if not exists)
-- - lessons (already has course hierarchy)

-- New/Updated columns needed:
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status ENUM('draft','published','archived');
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_by CHAR(36);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS created_by CHAR(36);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS status ENUM('draft','published','archived');

-- New table for quiz questions (if not exists)
CREATE TABLE quiz_questions (
  id INT NOT NULL AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_order INT NOT NULL,
  question_type ENUM('multiple_choice','short_answer','true_false'),
  PRIMARY KEY (id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

## API Endpoints Structure

### Instructor Authentication

```
POST   /api/instructor/login
POST   /api/instructor/logout
GET    /api/instructor/me
```

### Course Management

```
GET    /api/instructor/courses              # Get all instructor's courses
POST   /api/instructor/courses              # Create course
GET    /api/instructor/courses/:id          # Get course details
PUT    /api/instructor/courses/:id          # Update course
DELETE /api/instructor/courses/:id          # Delete course
GET    /api/instructor/courses/:id/stats    # Get course statistics
```

### Module Management

```
POST   /api/instructor/courses/:courseId/modules
PUT    /api/instructor/modules/:id
DELETE /api/instructor/modules/:id
```

### Lesson Management

```
POST   /api/instructor/modules/:moduleId/lessons
PUT    /api/instructor/lessons/:id
DELETE /api/instructor/lessons/:id
```

### Quiz Management

```
GET    /api/instructor/quizzes             # Get all instructor's quizzes
POST   /api/instructor/quizzes             # Create quiz
GET    /api/instructor/quizzes/:id         # Get quiz details
PUT    /api/instructor/quizzes/:id         # Update quiz
DELETE /api/instructor/quizzes/:id         # Delete quiz
GET    /api/instructor/quizzes/:id/responses # Get student responses
POST   /api/instructor/quizzes/:id/questions # Add question
```

## File Organization Timeline

### Phase 1: Authentication & Dashboard

- InstructorLogin.jsx
- InstructorDashboard.jsx
- instructorController.js
- instructorRoutes.js
- roleAuth middleware

### Phase 2: Course Management

- CreateCourse.jsx
- ManageCourses.jsx
- editCourse.jsx
- courseManagementController.js
- courseManagementRoutes.js

### Phase 3: Module & Lesson Creation

- CreateModule.jsx
- CreateLesson.jsx
- CourseDetail.jsx
- Lesson form components

### Phase 4: Quiz Management

- CreateQuiz.jsx
- QuizForm.jsx
- QuestionForm.jsx
- quizManagementController.js
- quizManagementRoutes.js

### Phase 5: Analytics & Responses

- ViewResponses.jsx
- Analytics.jsx
- useInstructor hook
- useCourse hook
- useQuiz hook

## Key Features Checklist

### Instructor Dashboard

- [ ] View all their courses
- [ ] Course statistics (enrollment, completion)
- [ ] Quick actions (create course, view responses)
- [ ] Recent activities

### Course Management

- [ ] Create draft/publish courses
- [ ] Edit course details (title, description, cover)
- [ ] Manage modules & lessons
- [ ] Set course level/duration
- [ ] Archive/delete courses

### Quiz Management

- [ ] Create multiple choice questions
- [ ] Create short answer questions
- [ ] Create true/false questions
- [ ] Set passing score
- [ ] View student responses
- [ ] Export results

### Student Management

- [ ] View enrolled students
- [ ] Track progress per student
- [ ] View quiz submissions
- [ ] Send feedback to students

---

This structure keeps instructor features separate while reusing existing authentication and database models. Would you like me to start building this out phase by phase?
