const express = require("express");
const router = express.Router();
const quizController = require("../controller/quizController");
const instructorQuizController = require("../controller/instructorQuizController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/create",
  authMiddleware.authenticateToken,
  instructorQuizController.createQuiz,
);
router.get(
  "/my",
  authMiddleware.authenticateToken,
  instructorQuizController.getMyQuizzes,
);

// Numeric ID routes (legacy support)
router.get(
  "/lesson/:lessonId(\\d+)",
  authMiddleware.authenticateToken,
  quizController.getQuizByLesson,
);
router.get(
  "/lesson/:lessonId(\\d+)/attempt",
  authMiddleware.authenticateToken,
  quizController.getMyAttempt,
);
router.post(
  "/lesson/:lessonId(\\d+)",
  authMiddleware.authenticateToken,
  quizController.createQuiz,
);
router.put(
  "/lesson/:lessonId(\\d+)",
  authMiddleware.authenticateToken,
  quizController.updateQuiz,
);
router.delete(
  "/lesson/:lessonId(\\d+)",
  authMiddleware.authenticateToken,
  quizController.deleteQuiz,
);

// Slug-based routes (NEW - security)
router.get(
  "/lesson/:lessonSlug",
  authMiddleware.authenticateToken,
  quizController.getQuizBySlug,
);
router.get(
  "/lesson/:lessonSlug/attempt",
  authMiddleware.authenticateToken,
  quizController.getMyAttemptBySlug,
);

router.get(
  "/:id",
  authMiddleware.authenticateToken,
  instructorQuizController.getQuizById,
);
router.put(
  "/:id",
  authMiddleware.authenticateToken,
  instructorQuizController.updateQuiz,
);
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  instructorQuizController.deleteQuiz,
);

module.exports = router;
