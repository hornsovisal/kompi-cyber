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

const router = express.Router();

// Public routes (no auth required)
router.post('/login', loginInstructor);
router.post('/send-otp', sendInstructorOTP);
router.post('/verify-otp', verifyInstructorOTP);

// Apply auth middleware to all other instructor routes
router.use(authMiddleware.authenticateToken);

// Dashboard
router.get('/stats', getDashboardStats);

// Courses
router.get('/courses', getInstructorCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourseDetail);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
