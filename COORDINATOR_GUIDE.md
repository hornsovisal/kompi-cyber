# Coordinator Course & Module Management Guide

## Overview

The Coordinator Portal allows NetworkCAD coordinators to manage courses and organize course content into modules. This guide explains how to create, edit, and manage courses and modules.

---

## Course Management

### Creating a Course

1. **Navigate to Courses**
   - Click "Courses" in the left sidebar
   - You'll see all your existing courses in a grid layout

2. **Click "New Course" Button**
   - Click the blue "New Course" button in the top right
   - A form will appear below the header

3. **Fill in Course Details**
   - **Course Title** _(required)_ - Enter a descriptive title
     - Example: "Introduction to Cybersecurity"
   - **Course Description** - Add details about what the course covers
   - **Level** - Select from:
     - Beginner
     - Intermediate
     - Advanced
     - Expert
   - **Duration** - Enter the estimated hours to complete

4. **Create Course**
   - Click "Create Course" button
   - Course appears in your courses grid

### Viewing Course Details

1. **Click on Any Course Card**
   - Click anywhere on the course card (except the action buttons)
   - Opens the full course detail page

2. **Course Detail Page Shows**
   - Course title and description
   - Quick stats: Level, Duration, Number of Modules, Enrolled Students
   - Two tabs: **Overview** and **Modules**

### Editing a Course

#### From CoursesGrid

1. Click the blue **Edit** button on the course card
2. Update course title, description, level, or duration in the grid
3. Click "Update Course" to save

#### From Course Detail Page

1. Click the blue **Edit** button in the header
2. Update description, level, and duration fields
3. Click "Save Changes"
4. Fields return to read-only mode

### Deleting a Course

1. On the courses grid, click the red **Trash** button on the course card
2. Confirm the deletion in the popup dialog
3. Course is removed immediately

---

## Module Management

Modules organize course content into sections. Each module can contain multiple lessons.

### Creating a Module

**From Course Detail Page:**

1. Click the **"Modules"** tab in the course detail page
2. Click the large green **"Add New Module"** button
3. A blue form appears with fields for:
   - **Module Title** _(required)_ - Name of the module section
     - Example: "Module 1: Networking Basics"
   - **Description** - What students will learn in this module
4. Click **"Create Module"** button
5. Module appears in the modules list with numbering

### Viewing Modules

**In Course Grid:**

- Each course card shows: "{X} modules" at the bottom
- Shows how many lessons are in the course

**In Course Detail Page:**

- Click the "Modules" tab to see all modules
- Each module shows:
  - Number (1, 2, 3, etc.)
  - Module title
  - Description (if provided)
  - Number of lessons
  - Edit and Delete buttons

### Editing a Module

1. Open the course detail page
2. Click the "Modules" tab
3. Click the blue **Edit** button on the module card
4. Update the title and/or description
5. Click **"Update Module"** button

### Deleting a Module

1. Open the course detail page
2. Click the "Modules" tab
3. Click the red **Delete** button on the module
4. Confirm deletion (this also deletes all lessons in the module)
5. Module is removed from the list

---

## Course Workflow

### Step-by-Step: Creating a Complete Course

```
1. Create Course
   ├─ Set title: "Web Security Essentials"
   ├─ Set description: "Learn to secure web applications"
   ├─ Set level: "Intermediate"
   └─ Set duration: "20 hours"

2. View Course Details
   └─ Click the course card to open detail page

3. Add Module 1
   ├─ Title: "Module 1: Common Threats"
   └─ Description: "Understand OWASP Top 10 and SQL Injection"

4. Add Module 2
   ├─ Title: "Module 2: Authentication"
   └─ Description: "Secure user authentication methods"

5. Add Module 3
   ├─ Title: "Module 3: Data Protection"
   └─ Description: "Encryption and data security"

6. Review Course
   └─ See all modules listed in the Modules tab
```

### Publishing Courses

- Courses are automatically **Draft** when created
- Once modules are added, courses are ready for students
- Students can enroll and access modules

---

## Course Statistics

In the course detail page header, you can see:

| Stat         | Meaning                                           |
| ------------ | ------------------------------------------------- |
| **Level**    | Difficulty: Beginner/Intermediate/Advanced/Expert |
| **Duration** | Total hours to complete the course                |
| **Modules**  | Number of modules in the course                   |
| **Students** | Number of students enrolled                       |

---

## Tips & Best Practices

### For Course Organization

✓ Create 4-6 modules per course for easy learning
✓ Number modules sequentially (Module 1, 2, 3, etc.)
✓ Keep module titles clear and descriptive
✓ Include key topics in descriptions

### For Student Experience

✓ Set realistic duration estimates
✓ Match level to target audience
✓ Organize from simple (beginner) to complex topics
✓ Add descriptions explaining what students will learn

### Example Good Course Structure

```
Course: HTML & CSS Fundamentals
├─ Module 1: Getting Started with HTML
│  └─ Introduction to markup language
├─ Module 2: Structuring Web Pages
│  └─ Semantic HTML and best practices
├─ Module 3: Introduction to CSS
│  └─ Styling basics and selectors
└─ Module 4: Responsive Design
   └─ Mobile-first design approach
```

---

## Troubleshooting

### Course Not Appearing

- Refresh the page (F5)
- Check your browser's developer console for errors
- Ensure you're logged in as a coordinator

### Module Not Saving

- Check that the module title is entered (required field)
- Ensure you have internet connection
- Try again after a few seconds

### Can't Delete Course

- Verify you created the course (only creators can delete)
- Check if there are any issues preventing deletion
- Contact admin if problems persist

---

## Test Accounts

To test the coordinator features:

```
Email: netcad@kompi.com
Password: NetCAD@123
Role: Coordinator
```

Or use the default test coordinator:

```
Email: coordinator@test.com
Password: Coord@123
Role: Coordinator
```

---

## API Reference

The following API endpoints power the coordinator features:

### Courses

```
GET    /api/instructor/courses           - Get all coordinator's courses
GET    /api/instructor/courses/:id       - Get course details
POST   /api/instructor/courses           - Create new course
PUT    /api/instructor/courses/:id       - Update course
DELETE /api/instructor/courses/:id       - Delete course
```

### Modules

```
GET    /api/courses/:courseId/modules         - Get course modules
GET    /api/courses/:courseId/modules/:id    - Get module details
POST   /api/courses/:courseId/modules         - Create module
PUT    /api/courses/:courseId/modules/:id    - Update module
DELETE /api/courses/:courseId/modules/:id    - Delete module
```

---

## Keyboard Shortcuts

| Shortcut            | Action               |
| ------------------- | -------------------- |
| `Click course card` | Go to course details |
| `Esc`               | Close modals/forms   |
| `Tab`               | Navigate form fields |

---

## Next Steps

1. **Create your first course**
2. **Add modules** to organize content
3. **Add lessons** to modules (coming soon)
4. **Share with students** through the enrollment system

For more information, contact the NetworkCAD support team.
