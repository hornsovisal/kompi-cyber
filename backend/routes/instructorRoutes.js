const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getInstructorCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  getDashboardStats,
} = require('../controller/instructorController');

const router = express.Router();

// Apply auth middleware to all instructor routes
router.use(authMiddleware);

// Dashboard
router.get('/stats', getDashboardStats);

// Courses
router.get('/courses', getInstructorCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourseDetail);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
