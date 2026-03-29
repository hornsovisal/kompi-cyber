/**
 * rbacRoutes.js
 * Role-Based Access Control routes for the instructor dashboard system.
 *
 * Base path: /api/rbac
 *
 * Auth middleware:
 *   authenticateToken          → verifies JWT (all routes)
 *   requireCoordinator         → role === "coordinator"
 *   requireInstructor          → role === "instructor"
 *   requireInstructorOrCoordinator → either role
 */

const express = require('express');
const router  = express.Router();

const auth = require('../middleware/authMiddleware');

const {
  createCourse,
  getAllCourses,
  getCourseById,
  assignInstructor,
  inviteStudent,
  getCourseStudents,
  listInstructors,
} = require('../controller/rbacCourseController');

const {
  createQuiz,
  getQuizzesByCourse,
  getMyQuizzes,
  openQuiz,
  closeQuiz,
} = require('../controller/rbacQuizController');

// ── All routes below require a valid JWT ─────────────────────────────────────
router.use(auth.authenticateToken);

// ── COURSE ROUTES ─────────────────────────────────────────────────────────────
// POST   /api/rbac/courses                    → coordinator creates a course
// GET    /api/rbac/courses                    → all courses (role-filtered)
// GET    /api/rbac/courses/:id                → single course
// POST   /api/rbac/courses/assign-instructor  → coordinator assigns instructor
// POST   /api/rbac/courses/:courseId/invite-student → instructor invites student
// GET    /api/rbac/courses/:courseId/students → list students in a course

router.post('/courses', auth.requireCoordinator, createCourse);
router.get('/courses', auth.requireInstructorOrCoordinator, getAllCourses);
router.get('/courses/:id', auth.requireInstructorOrCoordinator, getCourseById);
router.post('/courses/assign-instructor', auth.requireCoordinator, assignInstructor);
router.post('/courses/:courseId/invite-student', auth.requireInstructor, inviteStudent);
router.get('/courses/:courseId/students', auth.requireInstructorOrCoordinator, getCourseStudents);

// ── INSTRUCTOR LIST (for coordinator UI) ─────────────────────────────────────
// GET  /api/rbac/instructors → list all instructors (coordinator only)
router.get('/instructors', auth.requireCoordinator, listInstructors);

// ── QUIZ ROUTES ───────────────────────────────────────────────────────────────
// POST /api/rbac/quizzes                      → instructor creates quiz
// GET  /api/rbac/quizzes/my                   → get my quizzes
// GET  /api/rbac/quizzes/course/:courseId     → get quizzes for a course
// PUT  /api/rbac/quizzes/:id/open             → open a quiz
// PUT  /api/rbac/quizzes/:id/close            → close a quiz

router.post('/quizzes', auth.requireInstructor, createQuiz);
router.get('/quizzes/my', auth.requireInstructorOrCoordinator, getMyQuizzes);
router.get('/quizzes/course/:courseId', auth.requireInstructorOrCoordinator, getQuizzesByCourse);
router.put('/quizzes/:id/open',  auth.requireInstructor, openQuiz);
router.put('/quizzes/:id/close', auth.requireInstructor, closeQuiz);

module.exports = router;
