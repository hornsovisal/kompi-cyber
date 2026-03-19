const submissionModel = require('../models/Submission');

exports.submitQuiz = async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id;
  const { answers } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ message: 'Answers array is required' });
  }

  try {
    const result = await submissionModel.submitQuiz({ lessonId, userId, answers });
    return res.json({ success: true, ...result });
  } catch (err) {
    const message = err.message || 'Database error';
    if (message.startsWith('Invalid') || message.includes('required')) {
      return res.status(400).json({ message });
    }
    return res.status(500).json({ message: 'Database error', error: message });
  }
};
