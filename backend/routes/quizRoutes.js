const express = require('express');
const router = express.Router();
const quizController = require('../controller/quizController');
const instructorQuizController = require('../controller/instructorQuizController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware.authenticateToken, instructorQuizController.createQuiz);
router.get('/my', authMiddleware.authenticateToken, instructorQuizController.getMyQuizzes);

router.get('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.getQuizByLesson);
router.get('/lesson/:lessonId/attempt', authMiddleware.authenticateToken, quizController.getMyAttempt);
router.post('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.createQuiz);
router.put('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.updateQuiz);
router.delete('/lesson/:lessonId', authMiddleware.authenticateToken, quizController.deleteQuiz);

router.get('/:id', authMiddleware.authenticateToken, instructorQuizController.getQuizById);
router.put('/:id', authMiddleware.authenticateToken, instructorQuizController.updateQuiz);
router.delete('/:id', authMiddleware.authenticateToken, instructorQuizController.deleteQuiz);

module.exports = router;
