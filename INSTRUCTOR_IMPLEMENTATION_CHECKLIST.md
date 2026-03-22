# Instructor Feature Implementation Checklist

**Developer**: You (whitecyber)  
**Scope**: Full-stack (frontend + backend)

## 📋 Files to Create

### Frontend Pages (You'll Design)
```
frontend/src/pages/instructor/
├── [ ] InstructorLogin.jsx          # Login page
├── [ ] InstructorDashboard.jsx      # Main dashboard (your design)
├── [ ] CreateCourse.jsx             # Create new course form
├── [ ] EditCourse.jsx               # Edit course form
├── [ ] ManageCourses.jsx            # List all instructor's courses
├── [ ] CourseDetail.jsx             # Course details & settings
├── [ ] CreateModule.jsx             # Add module to course
├── [ ] CreateLesson.jsx             # Add lesson to module
├── [ ] CreateQuiz.jsx               # Create quiz form
├── [ ] EditQuiz.jsx                 # Edit quiz form
├── [ ] ManageQuizzes.jsx            # List instructor's quizzes
├── [ ] ViewResponses.jsx            # View student quiz responses
└── [ ] Analytics.jsx                # Course analytics
```

### Frontend Components
```
frontend/src/components/instructor/
├── [ ] CourseCard.jsx               
├── [ ] CourseForm.jsx               
├── [ ] ModuleForm.jsx               
├── [ ] LessonForm.jsx               
├── [ ] QuizForm.jsx                 
├── [ ] QuestionForm.jsx             
├── [ ] StatCard.jsx                 
├── [ ] StudentResponsesList.jsx     
└── [ ] CourseStats.jsx              
```

### Frontend Layouts & Hooks
```
frontend/src/components/Layout/
├── [ ] InstructorLayout.jsx         # Main layout with sidebar

frontend/src/hooks/
├── [ ] useInstructor.js             # Instructor data & auth
├── [ ] useCourse.js                 # Course management
└── [ ] useQuiz.js                   # Quiz management
```

### Backend Controllers
```
backend/controller/
├── [ ] instructorController.js      # Instructor dashboard logic
├── [ ] courseManagementController.js # Course CRUD
├── [ ] quizManagementController.js  # Quiz CRUD
└── [ ] moduleController.js          # Module CRUD
```

### Backend Routes
```
backend/routes/
├── [ ] instructorRoutes.js          # Auth routes
├── [ ] courseManagementRoutes.js    # Course endpoints
├── [ ] quizManagementRoutes.js      # Quiz endpoints
└── [ ] moduleManagementRoutes.js    # Module endpoints
```

### Backend Middleware
```
backend/middleware/
├── [ ] roleAuth.js                  # Check user role
└── [ ] instructorAuth.js            # Verify instructor access
```

---

## 🚀 Implementation Order (Recommended)

### Phase 1: Authentication (Week 1)
- [ ] Backend: Auth validation for instructor role
- [ ] Frontend: InstructorLogin page
- [ ] Middleware: Role-based access control

### Phase 2: Dashboard (Week 1-2)
- [ ] Backend: Fetch instructor courses & stats
- [ ] Frontend: InstructorDashboard page (your design)
- [ ] Frontend: InstructorLayout & Sidebar

### Phase 3: Course Management (Week 2)
- [ ] Backend: Create/Read/Update/Delete courses
- [ ] Frontend: CreateCourse & EditCourse pages
- [ ] Frontend: ManageCourses page
- [ ] Frontend: CourseCard & CourseForm components

### Phase 4: Module & Lesson Management (Week 3)
- [ ] Backend: Module CRUD endpoints
- [ ] Backend: Lesson CRUD endpoints
- [ ] Frontend: CreateModule & CreateLesson pages
- [ ] Frontend: CourseDetail page

### Phase 5: Quiz Management (Week 3-4)
- [ ] Backend: Quiz CRUD endpoints
- [ ] Backend: Question management
- [ ] Frontend: CreateQuiz & EditQuiz pages
- [ ] Frontend: QuizForm & QuestionForm components

### Phase 6: Analytics & Responses (Week 4)
- [ ] Backend: Student response tracking
- [ ] Frontend: ViewResponses page
- [ ] Frontend: Analytics page
- [ ] Frontend: CourseStats component

---

## 📊 Database Schema Updates Needed

Before implementation, make sure your database has:

```sql
-- Check existing columns:
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status ENUM('draft','published','archived') DEFAULT 'draft';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_by CHAR(36);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS created_by CHAR(36) NOT NULL;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS status ENUM('draft','published','archived') DEFAULT 'draft';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS created_by CHAR(36);

-- Create quiz_questions table if not exists:
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT NOT NULL AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice','short_answer','true_false','essay') NOT NULL,
  correct_answer TEXT,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create question_options table if not exists:
CREATE TABLE IF NOT EXISTS question_options (
  id INT NOT NULL AUTO_INCREMENT,
  quiz_question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  option_order INT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  FOREIGN KEY (quiz_question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);
```

---

## 🔗 API Endpoints to Implement

### Authentication
```
POST   /api/instructor/login
POST   /api/instructor/logout
GET    /api/instructor/me
```

### Courses
```
GET    /api/instructor/courses              # List all instructor's courses
POST   /api/instructor/courses              # Create course
GET    /api/instructor/courses/:id          # Get course detail
PUT    /api/instructor/courses/:id          # Update course
DELETE /api/instructor/courses/:id          # Delete course
GET    /api/instructor/courses/:id/stats    # Get course statistics
```

### Modules
```
POST   /api/instructor/courses/:courseId/modules
PUT    /api/instructor/modules/:id
DELETE /api/instructor/modules/:id
```

### Lessons
```
POST   /api/instructor/modules/:moduleId/lessons
PUT    /api/instructor/lessons/:id
DELETE /api/instructor/lessons/:id
```

### Quizzes
```
GET    /api/instructor/quizzes                    # List all quizzes
POST   /api/instructor/quizzes                    # Create quiz
GET    /api/instructor/quizzes/:id                # Get quiz detail
PUT    /api/instructor/quizzes/:id                # Update quiz
DELETE /api/instructor/quizzes/:id                # Delete quiz
POST   /api/instructor/quizzes/:id/questions      # Add question
PUT    /api/instructor/quizzes/questions/:id      # Update question
DELETE /api/instructor/quizzes/questions/:id      # Delete question
GET    /api/instructor/quizzes/:id/responses      # Get student responses
```

---

## ✅Key Features Checklist

### Instructor Features Required
- [ ] View all their created courses
- [ ] Create new courses (title, description, level, duration)
- [ ] Edit course details
- [ ] Delete courses
- [ ] View course enrollment/statistics
- [ ] Create modules within courses
- [ ] Create lessons within modules
- [ ] Edit lesson content
- [ ] Create quizzes for lessons
- [ ] Create quiz questions (Multiple choice, short answer, true/false)
- [ ] View student quiz responses
- [ ] View student course progress
- [ ] Export analytics reports

Good luck! You've got this! 🚀
