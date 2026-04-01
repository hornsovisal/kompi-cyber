const express = require("express");
const router = express.Router();
const submissionController = require("../controller/submissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Submission routes with dynamic identifiers (numeric ID or slug)
router.post(
  "/lesson/:identifier/reset",
  authMiddleware.authenticateToken,
  (req, res, next) => {
    const identifier = req.params.identifier;
    if (/^\d+$/.test(identifier)) {
      req.params.lessonId = identifier;
      return submissionController.resetQuiz(req, res, next);
    } else {
      req.params.lessonSlug = identifier;
      return submissionController.resetQuizBySlug(req, res, next);
    }
  },
);

router.get(
  "/lesson/:identifier/review",
  authMiddleware.authenticateToken,
  (req, res, next) => {
    const identifier = req.params.identifier;
    if (/^\d+$/.test(identifier)) {
      req.params.lessonId = identifier;
      return submissionController.getQuizReview(req, res, next);
    } else {
      req.params.lessonSlug = identifier;
      return submissionController.getQuizReviewBySlug(req, res, next);
    }
  },
);

router.post(
  "/lesson/:identifier",
  authMiddleware.authenticateToken,
  (req, res, next) => {
    const identifier = req.params.identifier;
    if (/^\d+$/.test(identifier)) {
      req.params.lessonId = identifier;
      return submissionController.submitQuiz(req, res, next);
    } else {
      req.params.lessonSlug = identifier;
      return submissionController.submitQuizBySlug(req, res, next);
    }
  },
);

module.exports = router;
