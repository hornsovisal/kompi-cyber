const express = require('express');
const router = express.Router();
const quizController = require('../controller/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.getQuizByLesson);
router.get('/lesson/:lessonId/attempt', authMiddleware.authenticateToken, quizController.getMyAttempt);
router.post('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.createQuiz);
router.put('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.updateQuiz);
router.delete('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.deleteQuiz);

module.exports = router;
