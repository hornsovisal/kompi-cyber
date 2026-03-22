const db = require("../config/db");

// Fetch quiz questions and options for a lesson (without revealing correct options)
exports.getQuizByLesson = async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({ message: "Invalid lessonId" });
  }

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

  try {
    const [results] = await db.query(sql, [lessonId]);

    if (!results.length) {
      return res.status(404).json({ message: "No quiz found for this lesson" });
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

    return res.json({ success: true, data: Array.from(questionsMap.values()) });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  }
};

// Get the user's latest attempt for a lesson
exports.getMyAttempt = async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({ message: "Invalid lessonId" });
  }

  const userId = req.user?.sub || req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [attemptRows] = await db.query(
      `SELECT id AS attempt_id,
              score,
              attempt_no,
              submitted_at,
              passed
       FROM quiz_attempts
       WHERE lesson_id = ?
         AND user_id = ?
       ORDER BY attempt_no DESC, submitted_at DESC, id DESC
       LIMIT 1`,
      [lessonId, userId],
    );

    if (!attemptRows.length) {
      return res
        .status(404)
        .json({ message: "No attempt found for this lesson" });
    }

    const latestAttempt = attemptRows[0];
    const [answerRows] = await db.query(
      `SELECT qa.question_id,
              qa.selected_option_id,
              qa.is_correct
       FROM quiz_answers qa
       INNER JOIN quiz_questions qq ON qq.id = qa.question_id
       WHERE qa.attempt_id = ?
       ORDER BY qq.question_order ASC, qa.id ASC`,
      [latestAttempt.attempt_id],
    );

    const answers = answerRows.map((row) => ({
      question_id: row.question_id,
      selected_option_id: row.selected_option_id,
      is_correct: Boolean(row.is_correct),
    }));

    res.json({
      success: true,
      data: {
        attemptId: latestAttempt.attempt_id,
        score: latestAttempt.score,
        attemptNo: latestAttempt.attempt_no,
        submittedAt: latestAttempt.submitted_at,
        passed: Boolean(latestAttempt.passed),
        answers,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  }
};
