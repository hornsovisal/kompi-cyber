const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  loginInstructor,
  sendInstructorOTP,
  verifyInstructorOTP,
  getInstructorCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  getDashboardStats,
} = require('../controller/instructorController');

const {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} = require('../controller/instructorQuizController');

const router = express.Router();

// ── Public routes (no auth required) ───────────────────────────────────────
router.post('/login', loginInstructor);
router.post('/send-otp', sendInstructorOTP);
router.post('/verify-otp', verifyInstructorOTP);

// ── All routes below require a valid JWT ───────────────────────────────────
router.use(authMiddleware.authenticateToken);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Courses
router.get('/courses', getInstructorCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourseDetail);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// ── Quiz Management ─────────────────────────────────────────────────────────
// POST   /api/instructor/quizzes        — create a quiz
// GET    /api/instructor/quizzes        — list my quizzes
// GET    /api/instructor/quizzes/:id    — get one quiz
// PUT    /api/instructor/quizzes/:id    — update a quiz
// DELETE /api/instructor/quizzes/:id    — delete a quiz
router.post('/quizzes', createQuiz);
router.get('/quizzes', getMyQuizzes);
router.get('/quizzes/:id', getQuizById);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

module.exports = router;
