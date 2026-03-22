const express = require('express');
const router = express.Router();
const quizController = require('../controller/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.getQuizByLesson);
router.get('/lesson/:lessonId/attempt', authMiddleware.authenticateToken, quizController.getMyAttempt);

module.exports = router;
