const express = require('express');
const router = express.Router();
const submissionController = require('../controller/submissionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/lesson/:lessonId', authMiddleware.authenticateToken, submissionController.submitQuiz);

module.exports = router;
