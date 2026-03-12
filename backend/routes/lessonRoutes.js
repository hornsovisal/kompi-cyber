const express = require("express");
const router = express.Router();

const exerciseController = require("../controller/exerciseController");
const authMiddleware = require("../middleware/authMiddleware");

// All exercise routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET /api/lessons/:lessonId/exercises
router.get("/:lessonId/exercises", exerciseController.getExercisesByLesson);

module.exports = router;
