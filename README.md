# 🛡️ Kompi-Cyber: Cybersecurity Learning Management Platform

**Kompi-Cyber** is a **comprehensive, interactive learning management system** designed to deliver **structured cybersecurity education** with hands-on labs, real-time feedback, and progress tracking. Built with a modern tech stack (React + Express + MySQL), it provides students with an engaging platform to learn cybersecurity concepts through courses, exercises, quizzes, and practical simulations.

---

## 🔑 Test Accounts

Use these credentials to test different user roles:

| Role            | Email                  | Password          | Portal                                                                             |
| --------------- | ---------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| **Admin**       | `admin@kompi.com`      | `Admin@2026`      | [/admin/dashboard](https://kompi-cyber2323.vercel.app/admin/dashboard)             |
| **Teacher**     | `teacher@test.com`     | `Teacher@123`     | [/instructor/dashboard](https://kompi-cyber2323.vercel.app/instructor/dashboard)   |
| **Coordinator** | `coordinator@test.com` | `Coordinator@789` | [/coordinator/dashboard](https://kompi-cyber2323.vercel.app/coordinator/dashboard) |

> **Admin Portal Features:**
>
> - Manage all users (create, edit, delete)
> - Add/remove teachers and coordinators
> - View system analytics

> **Teacher Portal Features:**
>
> - Create and manage courses
> - Create quizzes and exercises
> - Track student performance

> **Coordinator Portal Features:**
>
> - Oversee programs and courses
> - Monitor student progress
> - Generate reports

---

## 🎯 Project Purpose

Kompi-Cyber was created to democratize cybersecurity education for CADT students by providing:

- **Structured Learning Paths:** Organized courses with modules and lessons
- **Interactive Content:** Quizzes, exercises, and practical labs
- **Progress Tracking:** Real-time completion metrics and student performance analytics
- **Instructor Tools:** Dashboard for course management and student oversight
- **Certification System:** Earn recognized certificates upon course completion
- **Flexible Enrollment:** Both self-paced and instructor-led course options

---

## ✨ Key Features

### 📚 Course Management

- **Dual Course Types:** Self-paced (online-led) and cohort-based (instructor-led) models
- **Structured Content:** Courses → Modules → Lessons → Exercises & Quizzes

### 👥 User Roles & Management

- **Student Accounts:** Registration, course enrollment, progress tracking
- **Instructor Dashboard:** Create courses, invite students, monitor progress
- **Role-Based Access Control:** Different permissions for students, instructors, and admins

### 📖 Learning Features

- **Lesson Content:** Rich markdown support with embedded code examples
- **Quizzes:** Multiple-choice assessments with instant feedback
- **Exercises:** Hands-on coding/lab challenges with test case validation
- **Progress Tracking:** Module/lesson completion percentages and time analytics
- **Certificates:** Auto-generated certificates upon course completion

### 🔐 Security & Authentication

- **JWT Token-Based Auth:** Secure user authentication and session management
- **Password Hashing:** bcryptjs for secure password storage
- **Email Verification:** Nodemailer integration for confirmation and notifications
- **Input Validation:** express-validator for XSS/SQL injection prevention
- **Security Headers:** Helmet.js for HTTP security headers
- **Rate Limiting:** Protection against brute force attacks

### 📊 Enrollment Management

- **Email Invitations:** Teachers invite students via email
- **Pending/Accepted/Rejected Status Tracking:** Manage invitation workflows
- **Auto-Enrollment:** Students automatically enrolled upon accepting invitations
- **Bulk Operations:** Send multiple invitations at once

### 🎓 Student Tools

- **Course Catalog:** Browse all available courses
- **Invitation Dashboard:** View and respond to course invitations
- **Progress Dashboard:** Track completion and performance metrics
- **Exercise Submissions:** Submit solutions with automated grading
- **Quiz Attempts:** Multiple attempts with score history

### 👨‍🏫 Instructor Tools

- **Course Creator:** Define course structure and add content
- **Student Management:** View enrolled students, track progress
- **Invitation Manager:** Send, resend, and revoke course invitations
- **Analytics:** See which students are struggling, completion rates
- **Content Editor:** Update lesson content and exercises

### 📄 Reporting & Certificates

- **PDF Certificates:** Auto-generated upon course completion
- **Performance Reports:** Detailed student performance analytics
- **Completion Tracking:** Module/lesson progress visualization

---

## 🔧 Tech Stack

### Backend

- **Framework:** Express.js 5.2.1
- **Database:** MySQL 8.0+ (mysql2/promise)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **File Storage:** Supabase (Images, Documents)
- **Email Service:** Nodemailer + Resend
- **Security:** Helmet.js, express-rate-limit, sanitize-html
- **Validation:** express-validator
- **PDF Generation:** PDFKit
- **Development:** Nodemon (auto-reload)

### Frontend

- **Framework:** React 18.2.0 + Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **CSS Framework:** Tailwind CSS 3.3.7
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Database Client:** Supabase JS

### Database

- **Primary DB:** MySQL (Courses, Users, Enrollments, Exercises)
- **Cloud Storage:** Supabase (File uploads, images)
- **Migrations:** SQL-based schema management

---

## 📋 System Requirements

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher (or yarn)
- **MySQL:** v8.0 or higher
- **Git:** For version control
- **Environment Variables:** `.env` file configuration

### Recommended

- **Postman:** For API testing
- **VS Code:** Code editor with extensions (ES7+, Prettier, Thunder Client)
- **MySQL Workbench:** Database management GUI

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/kompi-cyber.git
cd kompi-cyber
```

### 2️⃣ Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kompi_cyber

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key

# Email Service
RESEND_API_KEY=your_resend_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Initialize Database

```bash
# Run migrations
mysql -u root -p kompi_cyber < database/schema.sql
mysql -u root -p kompi_cyber < database/seed.sql

# (Optional) Add sample cybersecurity courses
node scripts/add-network-security-modules.js
```

#### Start Backend Server

```bash
# Development mode (with nodemon)
npm start

# You should see:
# ✅ Backend server running on http://localhost:5000
```

### 3️⃣ Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

#### Start Development Server

```bash
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
# ➜  press q to quit
```

### 4️⃣ Verify Installation

Visit `http://localhost:5173` in your browser:

- ✅ Homepage loads
- ✅ Can navigate to course catalog
- ✅ Registration/login works
- ✅ Backend API responds (check console for errors)

---

## 🎯 Quick Start

### For Students

1. **Register Account**
   - Visit `http://localhost:5173`
   - Click "Sign Up"
   - Verify email

2. **Enroll in Courses**
   - Browse course catalog
   - Join self-paced courses directly
   - Accept instructor invitations via email

3. **Complete Lessons**
   - Read lesson content
   - Take quizzes
   - Submit exercises
   - Track progress

4. **Earn Certificates**
   - Complete all modules
   - Pass final assessment
   - Download certificate

### For Instructors

1. **Login as Instructor**
   - Use instructor account (admin creates these)
   - Access instructor dashboard

2. **Create a Course**
   - Click "Create New Course"
   - Select course type (Online-Led or Instructor-Led)
   - Add title, description, syllabus

3. **Add Content**
   - Create modules (weeks)
   - Add lessons with markdown content
   - Create quizzes and exercises

4. **Manage Students**
   - Copy invitation link or send via email
   - View enrolled students
   - Monitor progress and performance

---

## 📁 Project Structure

```
kompi-cyber/
├── backend/                           # Express.js API Server
│   ├── config/                        # Database & Supabase config
│   │   ├── db.js                     # MySQL connection pool
│   │   └── supabase.js               # Supabase client
│   ├── controller/                    # Business logic
│   │   ├── authController.js         # User auth, registration
│   │   ├── courseController.js       # Course CRUD operations
│   │   ├── lessonController.js       # Lesson management
│   │   ├── quizController.js         # Quiz & questions
│   │   ├── exerciseController.js     # Exercise handling
│   │   ├── instructorController.js   # Instructor dashboard
│   │   └── enrollmentController.js   # Enrollment logic
│   ├── middleware/                    # Express middleware
│   │   └── authMiddleware.js         # JWT verification
│   ├── models/                        # Database models/queries
│   │   ├── userModel.js
│   │   ├── courseModel.js
│   │   ├── lessonModel.js
│   │   ├── quizModel.js
│   │   └── submissionModel.js
│   ├── routes/                        # API endpoints
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── exerciseRoutes.js
│   │   └── instructorRoutes.js
│   ├── utils/                         # Helper functions
│   ├── scripts/                       # Setup & migration scripts
│   │   ├── add-network-security-modules.js
│   │   └── add-intro-to-cyber-modules.js
│   ├── server.js                      # Express app setup
│   ├── package.json                   # Dependencies
│   └── .env                           # Environment variables

├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/                # Reusable React components
│   │   │   ├── student/              # Student-specific components
│   │   │   ├── instructor/           # Instructor-specific components
│   │   │   ├── auth/                 # Login/Register components
│   │   │   └── common/               # Shared components
│   │   ├── pages/                     # Page components
│   │   │   ├── CourseCatalog.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   └── LessonView.jsx
│   │   ├── utils/                     # Helper functions
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── App.jsx                    # Main app component
│   │   └── main.jsx                   # Entry point
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite configuration
│   └── .env.local                     # Environment variables

├── database/                          # Database schemas & migrations
│   ├── schema.sql                     # Complete database schema
│   ├── seed.sql                       # Sample data
│   ├── migrations/                    # Database migrations
│   └── scripts/                       # SQL utility scripts

├── docs/                              # Documentation
│   ├── SETUP_GUIDE.md                # Installation guide
│   ├── API_FRONTEND.md                # API endpoints documentation
├── upload/                            # File uploads directory
│   └── lesson/                        # Lesson content uploads

├── README.md                          # This file
├── package.json                       # Root package.json
└── .env.example                       # Environment template
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register              # Create new user account
POST   /api/auth/login                 # User login (returns JWT)
POST   /api/auth/logout                # Logout user
GET    /api/auth/me                    # Get current logged-in user
POST   /api/auth/refresh               # Refresh JWT token
```

### Courses

```
GET    /api/courses                    # List all courses
GET    /api/courses/:id                # Get course details
POST   /api/courses                    # Create new course (instructor)
PUT    /api/courses/:id                # Update course (instructor)
DELETE /api/courses/:id                # Delete course (instructor)
```

### Lessons

```
GET    /api/lessons/course/:courseId   # Get lessons in a course
GET    /api/lessons/:id                # Get lesson details
POST   /api/lessons                    # Create lesson (instructor)
PUT    /api/lessons/:id                # Update lesson (instructor)
```

### Quizzes & Exercises

```
GET    /api/quizzes/lesson/:lessonId   # Get quiz for lesson
POST   /api/quizzes/attempt            # Submit quiz attempt
GET    /api/exercises/lesson/:lessonId # Get exercises for lesson
POST   /api/exercises/submit           # Submit exercise solution
```

### Enrollment

```
GET    /api/enrollments/my-courses     # Get student's courses
POST   /api/enrollments/enroll         # Enroll in a course
GET    /api/enrollments/course/:id     # Get course enrollment stats
```

### Invitations

```
GET    /api/invitations/my-invitations # Get student's invitations
POST   /api/invitations/accept         # Accept course invitation
POST   /api/invitations/reject         # Reject invitation
POST   /api/invitations/send           # Instructor send invitations
```

---

## 🗄️ Database Schema Overview

### Core Tables

- **users** - User accounts (students, instructors, admins)
- **courses** - Course definitions
- **modules** - Course modules/weeks
- **lessons** - Individual lessons
- **enrollments** - Student course enrollments
- **course_invitations** - Invitation workflow

### Learning Tables

- **quizzes** - Quiz definitions
- **quiz_questions** - Individual quiz questions
- **quiz_options** - Multiple choice options
- **quiz_attempts** - Student quiz attempts
- **exercises** - Coding/lab exercises
- **exercise_submissions** - Student solutions
- **lesson_progress** - Lesson completion tracking

### Certificates

- **certificates** - Earned certificates
- **certificate_templates** - Certificate designs

---

## 🧪 Testing the System

### Test API Endpoints

```bash
# Using curl
curl -X GET http://localhost:5000/api/courses

# Using Postman
Import API_FRONTEND.md for full endpoint collection
```

### Create Test Course

```bash
cd backend
node scripts/add-network-security-modules.js
```

### Test Student Workflow

1. Register as student
2. Enroll in "Network Security Basics"
3. Complete Lesson 1
4. Take quiz
5. Submit exercise

### Test Instructor Workflow

1. Login as instructor
2. Create new course (instructor-led)
3. Add 2-3 lessons
4. Send invitations to test students
5. Monitor student progress

---

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based user sessions
- **Password Hashing** - bcryptjs (salted & hashed)
- **Input Validation** - express-validator prevents XSS
- **HTML Sanitization** - Prevent script injection
- **CORS Protection** - Whitelist allowed origins
- **Rate Limiting** - Prevent brute force attacks
- **Security Headers** - Helmet.js for HTTP hardening
- **SQL Injection Prevention** - Parameterized querier
- Email Verification - Confirm user identity

---

## 🤝 Contributing

We welcome contributions!

How to Contribute

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Commit changes
git commit -m "Add: description of changes"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Create Pull Request on GitHub
```

---

### Team & Credits

**Developed By:** Kompi-Cyber Development Team

**Course:** Web Development

**Institution:** Cambodia Academy of Digital Technology (CADT)

**Key Contributors:**

- Horn Sovisal – Backend Developer
- Kue Chanchessika – Backend Developer
- Chhit Sovathana – Database Developer
- Khy Gio – Frontend Developer
- Kuyseng Marakat – Frontend Developer

---

## 📄 License

This project is licensed under the ISC License - see [LICENSE](LICENSE) file for details.

---

## 🗺️ Project Roadmap

### V1.0 (Current)

✅ Basic course management
✅ Student enrollment
✅ Quiz and exercise system
✅ Instructor dashboard
✅ Certificate generation

### V2.0 (Planned)

🚧 AI-powered adaptive learning
🚧 Virtual lab sandbox environment
🚧 Real-time code execution
🚧 Peer review system
🚧 Advanced analytics

## 🎓 Getting Started Resources

- 📖 [Setup Guide](docs/SETUP_GUIDE.md)
- 🔌 [API Documentation](docs/API_FRONTEND.md)
