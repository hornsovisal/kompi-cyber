const express = require("express");
const router = express.Router();
const quizController = require("../controller/quizController");
const instructorQuizController = require("../controller/instructorQuizController");
const authMiddleware = require("../middleware/authMiddleware");

// Keyword routes (must come first)
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

// Lesson-based routes with dynamic identifiers (numeric ID or slug)
router.get(
  "/lesson/:identifier/attempt",
  authMiddleware.authenticateToken,
  (req, res, next) => {
    const identifier = req.params.identifier;
    if (/^\d+$/.test(identifier)) {
      req.params.lessonId = identifier;
      return quizController.getMyAttempt(req, res, next);
    } else {
      req.params.lessonSlug = identifier;
      return quizController.getMyAttemptBySlug(req, res, next);
    }
  },
);

router.get(
  "/lesson/:identifier",
  authMiddleware.authenticateToken,
  (req, res, next) => {
    const identifier = req.params.identifier;
    if (/^\d+$/.test(identifier)) {
      req.params.lessonId = identifier;
      return quizController.getQuizByLesson(req, res, next);
    } else {
      req.params.lessonSlug = identifier;
      return quizController.getQuizBySlug(req, res, next);
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
      return quizController.createQuiz(req, res, next);
    }
    return res.status(400).json({ message: "Invalid lesson identifier" });
  },
);

router.put(
  "/lesson/:identifier",
  authMiddleware.authenticateToken,
  (req, res, next) => {
    const identifier = req.params.identifier;
    if (/^\d+$/.test(identifier)) {
      req.params.lessonId = identifier;
      return quizController.updateQuiz(req, res, next);
    }
    return res.status(400).json({ message: "Invalid lesson identifier" });
  },
);

router.delete(
  "/lesson/:identifier",
  authMiddleware.authenticateToken,
  (req, res, next) => {
    const identifier = req.params.identifier;
    if (/^\d+$/.test(identifier)) {
      req.params.lessonId = identifier;
      return quizController.deleteQuiz(req, res, next);
    }
    return res.status(400).json({ message: "Invalid lesson identifier" });
  },
);

// Quiz ID routes
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
