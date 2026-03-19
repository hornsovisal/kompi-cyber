const db = require('../config/db');

// Fetch quiz questions and options for a lesson (without revealing correct options)
exports.getQuizByLesson = (req, res) => {
  const { lessonId } = req.params;

  const sql = `
    SELECT q.id AS question_id,
           q.question_text,
           o.id AS option_id,
           o.option_text
    FROM quiz_questions q
    LEFT JOIN quiz_options o ON o.question_id = q.id
    WHERE q.lesson_id = ?
    ORDER BY q.id, o.id
  `;

  db.query(sql, [lessonId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (!results.length) {
      return res.status(404).json({ message: 'No quiz found for this lesson' });
    }

    const questionsMap = new Map();
    results.forEach((row) => {
      const question = questionsMap.get(row.question_id) || {
        id: row.question_id,
        question_text: row.question_text,
        options: [],
      };

      if (row.option_id) {
        question.options.push({
          id: row.option_id,
          option_text: row.option_text,
        });
      }

      questionsMap.set(row.question_id, question);
    });

    res.json({ success: true, data: Array.from(questionsMap.values()) });
  });
};

// Get the user's latest attempt for a lesson
exports.getMyAttempt = (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const sql = `
    SELECT a.id AS attempt_id,
           a.score,
           a.attempt_no,
           a.submitted_at,
           qa.question_id,
           qa.selected_option_id,
           qa.is_correct
    FROM quiz_attempts a
    LEFT JOIN quiz_answers qa ON qa.attempt_id = a.id
    WHERE a.lesson_id = ?
      AND a.user_id = ?
    ORDER BY qa.id
  `;

  db.query(sql, [lessonId, userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (!rows.length) {
      return res.status(404).json({ message: 'No attempt found for this lesson' });
    }

    const { attempt_id, score, attempt_no, submitted_at } = rows[0];
    const answers = rows
      .filter((r) => r.question_id !== null)
      .map((r) => ({
        question_id: r.question_id,
        selected_option_id: r.selected_option_id,
        is_correct: Boolean(r.is_correct),
      }));

    res.json({
      success: true,
      data: {
        attemptId: attempt_id,
        score,
        attemptNo: attempt_no,
        submittedAt: submitted_at,
        answers,
      },
    });
  });
};
