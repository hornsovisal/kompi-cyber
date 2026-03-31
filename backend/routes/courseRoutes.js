const express = require("express");
const router = express.Router();

const courseController = require("../controller/courseController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/courses (public catalog)
router.get("/", courseController.getCourses);

// GET /api/courses/:id (public details)
router.get("/:id", courseController.getCourseById);

// POST /api/courses (admin only)
router.post(
  "/",
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  courseController.createCourse,
);

// PUT /api/courses/:id (admin only)
router.put(
  "/:id",
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  courseController.updateCourse,
);

// DELETE /api/courses/:id (admin only)
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  courseController.deleteCourse,
);

// GET /api/courses/:courseId/lessons
router.get("/:courseId/lessons", courseController.getCourseLessons);

module.exports = router;
