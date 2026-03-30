const express = require("express");
const router = express.Router();
const submissionController = require("../controller/submissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Numeric ID routes (legacy support)
router.post(
  "/lesson/:lessonId(\\d+)",
  authMiddleware.authenticateToken,
  submissionController.submitQuiz,
);

router.get(
  "/lesson/:lessonId(\\d+)/review",
  authMiddleware.authenticateToken,
  submissionController.getQuizReview,
);

router.post(
  "/lesson/:lessonId(\\d+)/reset",
  authMiddleware.authenticateToken,
  submissionController.resetQuiz,
);

// Slug-based routes (NEW - security through obscured IDs)
router.post(
  "/lesson/:lessonSlug",
  authMiddleware.authenticateToken,
  submissionController.submitQuizBySlug,
);

router.get(
  "/lesson/:lessonSlug/review",
  authMiddleware.authenticateToken,
  submissionController.getQuizReviewBySlug,
);

router.post(
  "/lesson/:lessonSlug/reset",
  authMiddleware.authenticateToken,
  submissionController.resetQuizBySlug,
);

module.exports = router;
