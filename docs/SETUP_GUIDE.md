# Kompi-Cyber Setup Guide for Development

This guide helps you set up the project with the new 17-week course curriculum.

## Prerequisites

- Node.js (v16+)
- MySQL (running and accessible)
- Git
- npm or yarn

## Step 1: Pull Latest Code

```bash
cd /path/to/kompi-cyber
git pull origin main
```

## Step 2: Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

## Step 3: Configure Environment

### Backend (.env)

Make sure you have correct database credentials in `backend/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=kompi_app
DB_PASSWORD=KompiApp2026Secure42
DB_NAME=kompiCyber
```

### Frontend (.env or .env.local)

Check `frontend/.env` for API configuration:

```
VITE_API_URL=http://localhost:5000
```

## Step 4: Clean and Populate Database

The project includes 3 database population scripts. Run them in order:

### Option A: Clean Everything + Repopulate (Recommended for Fresh Start)

```bash
cd backend

# 1. Clean all old course data
node scripts/cleanup-courses.js

# 2. Populate Introduction to Cybersecurity (7 weeks)
node scripts/add-intro-to-cyber-modules.js

# 3. Populate Ethical Hacking Essentials / Linux (4 weeks)
node scripts/add-intro-to-linux-modules.js

# 4. Populate Network Security (6 weeks)
node scripts/add-network-security-modules.js
```

### Option B: Only Populate Without Cleanup

If you already have the database structure, just run the population scripts:

```bash
cd backend
node scripts/add-intro-to-cyber-modules.js
node scripts/add-intro-to-linux-modules.js
node scripts/add-network-security-modules.js
```

## Step 5: Start the Application

### In separate terminals:

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

Expected output:

```
[dotenv] injecting env...
Server running on port 5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Expected output:

```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:3001
```

## Step 6: Access the Application

Open your browser and go to:

```
http://localhost:3001
```

## What the Scripts Do

### cleanup-courses.js

- Removes all existing modules and lessons from all courses
- Cleans up related quiz, exercise, and progress data
- Safe cascade deletion following foreign key constraints

### add-intro-to-cyber-modules.js

- Creates 7 weeks of Intro to Cybersecurity course
- Adds lessons for: SOC operations, threat analysis, CIA Triad, IAM, malware, cloud security, incident response
- Populates from markdown files in `upload/lesson/intro-to-cyber-course/`

### add-intro-to-linux-modules.js

- Creates 4 weeks of Linux Security course
- Adds lessons for: fundamentals, hardening, firewall, monitoring & auditing
- Populates from markdown files in `upload/lesson/intro-to-linux-course/`

### add-network-security-modules.js

- Creates 6 weeks of Network Security course
- Adds lessons for: packet analysis, attacks, firewall, VPN, segmentation, threat hunting
- Populates from markdown files in `upload/lesson/network-security/`

## Course Structure After Setup

```
Introduction to Cybersecurity (ID: 1)
├── Week 1: Modern SOC & Threat Landscape
├── Week 2: Analyzing Cyber Threats
├── Week 3: CIA Triad & Security Principles
├── Week 4: Identity & Access Management
├── Week 5: Malware Analysis
├── Week 6: Cloud Security
└── Week 7: Incident Response Capstone

Ethical Hacking Essentials (ID: 2) - Linux Content
├── Week 1: Linux Fundamentals & Secure Terminal
├── Week 2: Hardening & Password Security
├── Week 3: Firewall Configuration & Network Security
└── Week 4: Monitoring, Auditing & Incident Response

Network Security Basics (ID: 3)
├── Week 1: Network Fundamentals & Packet Analysis
├── Week 2: Network Attacks & Intrusion Detection
├── Week 3: Firewall Hardening & iptables
├── Week 4: VPN & Encrypted Tunnels
├── Week 5: Network Segmentation & Zero Trust
└── Week 6: Threat Hunting & Network Forensics
```

## Troubleshooting

### Database Connection Error

```
Error: Cannot connect to database
```

**Solution:** Check `.env` credentials match your MySQL setup

### Script fails with "Course not found"

```
✗ Course not found: Introduction to Cybersecurity
```

**Solution:** Make sure courses exist in database or create them first via the UI

### Lessons not displaying in browser

```
Solution: Refresh browser (Ctrl+R) and ensure backend is running
```

### Table markdown not rendering

```
Solution: Make sure you have the latest LearnPage.jsx from git
```

## Development Notes

- Course content is stored in `upload/lesson/` directories
- Database stores full markdown content for lessons
- API endpoints:
  - `GET /api/courses` - List all courses
  - `GET /api/courses/:courseId/lessons` - Get lessons for a course
  - `GET /api/lessons/:lessonId` - Get specific lesson content

## Next Steps

After setup:

1. Login to the application
2. Enroll in a course
3. View lessons - each week should display correct content
4. Check that markdown tables render properly
5. Test lesson navigation between weeks

For issues or questions, check the backend server logs and browser console.
