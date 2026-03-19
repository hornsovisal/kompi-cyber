const quizModel = require('../models/Quiz');

// Fetch quiz questions and options for a lesson (without revealing correct options)
exports.getQuizByLesson = async (req, res) => {
  const { lessonId } = req.params;
  try {
    const questions = await quizModel.getQuestionsByLesson(lessonId);
    if (!questions.length) {
      return res.status(404).json({ message: 'No quiz found for this lesson' });
    }
    return res.json({ success: true, data: questions });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message || err });
  }
};

// Get the user's latest attempt for a lesson
exports.getMyAttempt = async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const attempt = await quizModel.getLatestAttempt(lessonId, userId);
    if (!attempt) {
      return res.status(404).json({ message: 'No attempt found for this lesson' });
    }
    return res.json({ success: true, data: attempt });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message || err });
  }
};
