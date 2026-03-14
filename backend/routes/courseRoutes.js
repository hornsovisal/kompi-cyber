const express = require("express");
const router = express.Router();

const courseController = require("../controller/courseController");
const authMiddleware = require("../middleware/authMiddleware");

// Course catalog routes (all protected by JWT).
// All course routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET /api/courses
router.get("/", courseController.getCourses);

// GET /api/courses/:id
router.get("/:id", courseController.getCourseById);

// POST /api/courses (admin only)
router.post("/", authMiddleware.requireAdmin, courseController.createCourse);

// PUT /api/courses/:id (admin only)
router.put("/:id", authMiddleware.requireAdmin, courseController.updateCourse);

// DELETE /api/courses/:id (admin only)
router.delete(
  "/:id",
  authMiddleware.requireAdmin,
  courseController.deleteCourse,
);

// GET /api/courses/:courseId/lessons
router.get("/:courseId/lessons", courseController.getCourseLessons);

module.exports = router;
