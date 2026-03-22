const db = require('../config/db');

exports.submitQuiz = async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({ message: 'Invalid lessonId' });
  }

  const userId = req.user?.sub || req.user?.id;
  const { answers } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ message: 'Answers array is required' });
  }

  try {
    const [questions] = await db.query(
      'SELECT id FROM quiz_questions WHERE lesson_id = ?',
      [lessonId],
    );

    if (!questions.length) {
      return res.status(404).json({ message: 'No quiz found for this lesson' });
    }

    const questionIds = questions.map((q) => Number(q.id));
    const totalQuestions = questionIds.length;

    const submittedQuestionIds = new Set(answers.map((a) => Number(a.question_id)));
    for (const qid of submittedQuestionIds) {
      if (!questionIds.includes(qid)) {
        return res.status(400).json({ message: `Invalid question_id: ${qid}` });
      }
    }

    const selectedOptionIds = answers
      .map((a) => Number(a.selected_option_id))
      .filter(Boolean);

    if (!selectedOptionIds.length) {
      return res.status(400).json({ message: 'At least one selected_option_id is required' });
    }

    const [options] = await db.query(
      `SELECT o.id, o.question_id, o.is_correct
       FROM quiz_options o
       WHERE o.id IN (?)`,
      [selectedOptionIds],
    );

    const optionById = new Map();
    options.forEach((opt) => optionById.set(Number(opt.id), opt));

    for (const answer of answers) {
      const selectedOptionId = Number(answer.selected_option_id);
      const questionId = Number(answer.question_id);
      const opt = optionById.get(selectedOptionId);

      if (!opt) {
        return res.status(400).json({ message: `Invalid selected_option_id: ${selectedOptionId}` });
      }
      if (Number(opt.question_id) !== questionId) {
        return res.status(400).json({
          message: `Option ${selectedOptionId} does not belong to question ${questionId}`,
        });
      }
    }

    const correctCount = answers.reduce((count, answer) => {
      const opt = optionById.get(Number(answer.selected_option_id));
      return count + (opt?.is_correct ? 1 : 0);
    }, 0);

    const score = Math.round((correctCount / totalQuestions) * 100);

    const [existing] = await db.query(
      `SELECT id, attempt_no
       FROM quiz_attempts
       WHERE user_id = ? AND lesson_id = ?
       LIMIT 1`,
      [userId, lessonId],
    );

    const attemptNo = existing.length ? Number(existing[0].attempt_no) + 1 : 1;
    let attemptId;

    if (existing.length) {
      attemptId = Number(existing[0].id);
      await db.query(
        'UPDATE quiz_attempts SET score = ?, attempt_no = ?, submitted_at = NOW() WHERE id = ?',
        [score, attemptNo, attemptId],
      );
      await db.query('DELETE FROM quiz_answers WHERE attempt_id = ?', [attemptId]);
    } else {
      const [insertAttempt] = await db.query(
        'INSERT INTO quiz_attempts (lesson_id, user_id, score, attempt_no) VALUES (?, ?, ?, ?)',
        [lessonId, userId, score, attemptNo],
      );
      attemptId = Number(insertAttempt.insertId);
    }

    const answerRows = answers.map((answer) => {
      const selectedOptionId = Number(answer.selected_option_id);
      const questionId = Number(answer.question_id);
      const opt = optionById.get(selectedOptionId);
      return [attemptId, questionId, selectedOptionId, Boolean(opt?.is_correct)];
    });

    if (answerRows.length) {
      await db.query(
        'INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES ?',
        [answerRows],
      );
    }

    return res.json({ success: true, score, totalQuestions, correctCount, attemptNo });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message || err });
  }
};
