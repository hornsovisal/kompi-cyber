const express = require("express");
const router = express.Router();

const ProgressController = require("../controller/progressController");
const authMiddleware = require("../middleware/authMiddleware");

// All progress routes require authentication
router.use(authMiddleware.authenticateToken);

// GET /api/progress/courses/:courseId - Teacher views all students' progress
router.get(
  "/courses/:courseId",
  authMiddleware.requireInstructor,
  ProgressController.getCourseProgress,
);

// GET /api/progress/courses/:courseId/students/:studentId - Teacher views specific student's progress
router.get(
  "/courses/:courseId/students/:studentId",
  authMiddleware.requireInstructor,
  ProgressController.getStudentProgress,
);

// GET /api/progress/my-progress/:courseId - Student views their own progress
router.get("/my-progress/:courseId", ProgressController.getMyProgress);

module.exports = router;
