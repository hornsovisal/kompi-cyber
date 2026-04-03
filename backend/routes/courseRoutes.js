const express = require("express");
const router = express.Router();

const courseController = require("../controller/courseController");
const authMiddleware = require("../middleware/authMiddleware");

// Course catalog routes (all protected by JWT).
// All course routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET /api/courses
router.get("/", courseController.getCourses);

// GET /api/courses/:identifier/lessons
router.get("/:identifier/lessons", (req, res, next) => {
  const identifier = req.params.identifier;
  if (/^\d+$/.test(identifier)) {
    req.params.courseId = identifier;
    return courseController.getCourseLessons(req, res, next);
  }
  // No slug support for lessons yet - just numeric
  return res.status(400).json({ message: "Invalid course identifier" });
});

// POST /api/courses/:id/clone (instructor only)
router.post(
  "/:id/clone",
  authMiddleware.requireInstructor,
  courseController.cloneCourse,
);

// GET /api/courses/:identifier - handles both numeric IDs and slugs
router.get("/:identifier", (req, res, next) => {
  const identifier = req.params.identifier;
  // Exclude route keywords
  if (identifier === "") {
    return next();
  }
  if (/^\d+$/.test(identifier)) {
    req.params.id = identifier;
    return courseController.getCourseById(req, res, next);
  } else {
    req.params.slug = identifier;
    return courseController.getCourseBySlug(req, res, next);
  }
});

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

module.exports = router;
