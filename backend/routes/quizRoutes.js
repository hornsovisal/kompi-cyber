const express = require('express');
const router = express.Router();
const quizController = require('../controller/quizController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/lesson/:lessonId', authenticate, quizController.getQuizByLesson);
router.get('/lesson/:lessonId/attempt', authenticate, quizController.getMyAttempt);

module.exports = router;
