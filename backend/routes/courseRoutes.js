const express = require("express");
const router = express.Router();

const courseController = require("../controller/courseController");
const authMiddleware = require("../middleware/authMiddleware");

// All course routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET /api/courses
router.get("/", courseController.getCourses);

// GET /api/courses/:id
router.get("/:id", courseController.getCourseById);

// POST /api/courses
router.post("/", courseController.createCourse);

// PUT /api/courses/:id
router.put("/:id", courseController.updateCourse);

// DELETE /api/courses/:id
router.delete("/:id", courseController.deleteCourse);

// GET /api/courses/:courseId/lessons
router.get("/:courseId/lessons", courseController.getCourseLessons);

module.exports = router;
