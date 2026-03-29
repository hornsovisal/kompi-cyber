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
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  assignInstructor,
  getCourseStudents,
  listInstructors,
} = require('../controller/rbacCourseController');

const {
  sendInvitation,
  getCourseInvitations,
  resendInvitation,
  cancelInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} = require('../controller/rbacInvitationController');

const {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizzesByCourse,
  getMyQuizzes,
  openQuiz,
  closeQuiz,
} = require('../controller/rbacQuizController');

// ── All routes below require a valid JWT ─────────────────────────────────────
router.use(auth.authenticateToken);

// ── COURSE ROUTES ─────────────────────────────────────────────────────────────
// POST   /api/rbac/courses                    → coordinator creates a course
// PUT    /api/rbac/courses/:id                → coordinator updates a course
// DELETE /api/rbac/courses/:id                → coordinator deletes a course
// GET    /api/rbac/courses                    → all courses (role-filtered)
// GET    /api/rbac/courses/:id                → single course
// POST   /api/rbac/courses/assign-instructor  → coordinator assigns instructor
// GET    /api/rbac/courses/:courseId/students → list students in a course
// POST   /api/rbac/courses/:courseId/invite-student → instructor sends invitation
// GET    /api/rbac/courses/:courseId/invitations → list invitations for a course

router.post('/courses', auth.requireCoordinator, createCourse);
router.put('/courses/:id', auth.requireCoordinator, updateCourse);
router.delete('/courses/:id', auth.requireCoordinator, deleteCourse);
router.get('/courses', auth.requireInstructorOrCoordinator, getAllCourses);
router.get('/courses/:id', auth.requireInstructorOrCoordinator, getCourseById);
router.post('/courses/assign-instructor', auth.requireCoordinator, assignInstructor);
router.get('/courses/:courseId/students', auth.requireInstructorOrCoordinator, getCourseStudents);
router.post('/courses/:courseId/invite-student', auth.requireInstructor, sendInvitation);
router.get('/courses/:courseId/invitations', auth.requireInstructorOrCoordinator, getCourseInvitations);

// ── INSTRUCTOR LIST (for coordinator UI) ─────────────────────────────────────
// GET  /api/rbac/instructors → list all instructors (coordinator only)
router.get('/instructors', auth.requireCoordinator, listInstructors);

// ── QUIZ ROUTES ───────────────────────────────────────────────────────────────
// POST /api/rbac/quizzes                      → instructor creates quiz
// GET  /api/rbac/quizzes/my                   → get my quizzes
// GET  /api/rbac/quizzes/:id                  → get a single quiz
// PUT  /api/rbac/quizzes/:id                  → update a quiz
// DELETE /api/rbac/quizzes/:id                → delete a quiz
// GET  /api/rbac/quizzes/course/:courseId     → get quizzes for a course
// PUT  /api/rbac/quizzes/:id/open             → open a quiz
// PUT  /api/rbac/quizzes/:id/close            → close a quiz

router.post('/quizzes', auth.requireInstructor, createQuiz);
router.get('/quizzes/my', auth.requireInstructorOrCoordinator, getMyQuizzes);
router.get('/quizzes/course/:courseId', auth.requireInstructorOrCoordinator, getQuizzesByCourse);
router.get('/quizzes/:id', auth.requireInstructorOrCoordinator, getQuizById);
router.put('/quizzes/:id', auth.requireInstructorOrCoordinator, updateQuiz);
router.delete('/quizzes/:id', auth.requireInstructorOrCoordinator, deleteQuiz);
router.put('/quizzes/:id/open',  auth.requireInstructorOrCoordinator, openQuiz);
router.put('/quizzes/:id/close', auth.requireInstructorOrCoordinator, closeQuiz);

// ── INVITATION ROUTES ────────────────────────────────────────────────────────
router.get('/invitations', getMyInvitations);
router.post('/invitations/:id/accept', acceptInvitation);
router.post('/invitations/:id/reject', rejectInvitation);
router.post('/invitations/:id/resend', auth.requireInstructorOrCoordinator, resendInvitation);
router.delete('/invitations/:id', auth.requireInstructorOrCoordinator, cancelInvitation);

module.exports = router;
