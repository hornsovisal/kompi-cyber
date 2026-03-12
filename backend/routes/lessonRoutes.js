const express = require("express");
const router = express.Router();

const exerciseController = require("../controller/exerciseController");
const lessonController = require("../controller/lessonController");
const authMiddleware = require("../middleware/authMiddleware");

// All exercise routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET /api/lessons/:lessonId/exercises
router.get("/:lessonId/exercises", exerciseController.getExercisesByLesson);

// GET /api/lessons/:id
router.get("/:id", lessonController.getLessonById);

// POST /api/lessons
router.post("/", lessonController.createLesson);

// PUT /api/lessons/:id
router.put("/:id", lessonController.updateLesson);

// DELETE /api/lessons/:id
router.delete("/:id", lessonController.deleteLesson);

module.exports = router;
