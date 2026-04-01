const express = require("express");
const router = express.Router();

const exerciseController = require("../controller/exerciseController");
const lessonController = require("../controller/lessonController");
const authMiddleware = require("../middleware/authMiddleware");

// Lesson routes, including nested exercise listing by lesson.
// All lesson routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET /api/lessons/course/:courseId
router.get("/course/:courseId", lessonController.getLessonsByCourse);

// GET /api/lessons/:identifier/exercises - handles both numeric IDs and slugs
router.get("/:identifier/exercises", (req, res, next) => {
  const identifier = req.params.identifier;
  if (/^\d+$/.test(identifier)) {
    req.params.lessonId = identifier;
    return exerciseController.getExercisesByLesson(req, res, next);
  } else {
    req.params.slug = identifier;
    return exerciseController.getExercisesBySlug(req, res, next);
  }
});

// GET /api/lessons/:identifier - handles both numeric IDs and slugs
router.get("/:identifier", (req, res, next) => {
  const identifier = req.params.identifier;
  // Exclude route handler keywords
  if (["course"].includes(identifier)) {
    return next();
  }
  if (/^\d+$/.test(identifier)) {
    req.params.id = identifier;
    return lessonController.getLessonById(req, res, next);
  } else {
    req.params.slug = identifier;
    return lessonController.getLessonBySlug(req, res, next);
  }
});

// POST /api/lessons/:id/complete
router.post("/:id/complete", lessonController.markLessonCompleted);

// POST /api/lessons
router.post("/", lessonController.createLesson);

// PUT /api/lessons/:id
router.put("/:id", lessonController.updateLesson);

// DELETE /api/lessons/:id
router.delete("/:id", lessonController.deleteLesson);

module.exports = router;
