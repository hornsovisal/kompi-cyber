const express = require('express');
const router = express.Router();
const submissionController = require('../controller/submissionController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/lesson/:lessonId', authenticate, submissionController.submitQuiz);

module.exports = router;
