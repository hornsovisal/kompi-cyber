# KOMPI-CYBER 

> A modern cybersecurity learning platform for cyber security student

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Users & Roles](#users--roles)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

---

##  Overview

**KOMPI-CYBER** is a comprehensive cybersecurity curriculum platform inspired by Cisco NetAcad. It supports multi-role learning: **Students**, **Instructors**, and **Administrators** with collaborative features, progress tracking, and certification systems.

---

## ✨ Features

### For Students
- Structured course curriculum (Domains → Courses → Modules → Lessons)
- Interactive quizzes & coding exercises
- Progress tracking & performance analytics
- Digital certificates on course completion
- Persistent learning state

### For Instructors
- Student roster & invitation system
- Class analytics & student performance metrics
- Add Quiz to course
- File storage for lesson resources

### For Cordinator
- Course authoring & content management
---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.2 + Vite 7.1 + Tailwind CSS |
| **Backend** | Node.js + Express.js 4.18 |
| **Database** | MySQL 8.0 (Aiven Cloud) |
| **Storage** | Supabase (file storage) |
| **Auth** | JWT + bcryptjs |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Railway |

**Live Links:**
- Website URL: https://kompi-cyber2323.vercel.app
---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git

### 1. Setup Backend
```bash
cd backend
npm install

# Create .env file
cat > .env << 'ENVEOF'
NODE_ENV=development
PORT=3000
DB_HOST=mysql-xxx.e.aivencloud.com
DB_PORT=19044
DB_USER=avnadmin
DB_PASSWORD=***
DB_NAME=kompiCyber
JWT_SECRET=your_secret
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_key
ENVEOF

npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev    # dev server
npm run build  # production build
```

### 3. Initialize Database
```bash
mysql -h $DB_HOST -p$DB_PASSWORD $DB_NAME < database/schema.sql
```

---

## 👥 Users & Roles

### Test Accounts (Ready to Use)

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | `coordinator@test.com` | `TestPass123!` | Platform management |
| **Instructor** | `teacher1@test.com` | `TestPass123!` | Course management |
| **Instructor** | `teacher2@test.com` | `TestPass123!` | Course management |
| **Instructor** | `teacher3@test.com` | `TestPass123!` | Course management |

### Login Example
```bash
curl -X POST https://kompi-cyber.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher1@test.com","password":"TestPass123!"}'
```

---

## 📚 API Documentation

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/courses` | GET | List all courses |
| `/api/enrollments` | POST | Enroll in course |
| `/api/quizzes/:lessonId/submit` | POST | Submit quiz |
| `/api/certificates/:courseId` | GET | Get certificate |

📖 **Full API Documentation:** [docs/API_FRONTEND.md](./docs/API_FRONTEND.md)

---

## 💻 Development

### Project Structure
```
kompi-cyber/
├── frontend/          # React + Vite (Vercel)
├── backend/           # Express.js (Railway)
├── database/          # SQL schemas & migrations
└── docs/              # API & setup documentation
```

### Development Workflow
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev
```

---

## 🧪 Testing the Instructor Dashboard

1. Login with teacher account: `teacher1@test.com` / `TestPass123!`
2. Navigate to "Instructor Dashboard"
3. Create a new course
4. Add modules and lessons
5. Invite students via email
6. View student performance analytics

---


## 👥 Team

**Cambodia Academy of Digital Technology (CADT)**

- Horn Sovisal – Backend Developer
- Kue Chanchessika – Backend Developer  
- Chhit Sovathana – Database Developer
- Khy Gio – Frontend Developer
- Kuyseng Marakat – Frontend Developer

---

## 📄 License

Proprietary - KOMPI-CYBER Learning Platform
© 2026 All rights reserved.

---

