const db = require("../config/db");

const PASSING_SCORE_PERCENT = 70;

exports.submitQuiz = async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({ message: "Invalid lessonId" });
  }

  const userId = req.user?.sub || req.user?.id;
  const { answers } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ message: "Answers array is required" });
  }

  let connection;

  try {
    // CHECK DEADLINE - Get lesson deadlines
    const [lessonData] = await db.query(
      `SELECT quiz_deadline FROM lessons WHERE id = ?`,
      [lessonId],
    );

    if (lessonData[0]?.quiz_deadline) {
      const deadline = new Date(lessonData[0].quiz_deadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(403).json({
          message: "Quiz submission deadline has passed",
          deadline: deadline.toISOString(),
        });
      }
    }

    const [questions] = await db.query(
      `SELECT id
       FROM quiz_questions
       WHERE lesson_id = ?
       ORDER BY question_order ASC, id ASC`,
      [lessonId],
    );

    if (!questions.length) {
      return res.status(404).json({ message: "No quiz found for this lesson" });
    }

    const questionIds = questions.map((q) => Number(q.id));
    const totalQuestions = questionIds.length;

    if (answers.length !== totalQuestions) {
      return res.status(400).json({
        message: `You must answer all questions (${totalQuestions}) exactly once`,
      });
    }

    const submittedQuestionIds = new Set(
      answers.map((a) => Number(a.question_id)),
    );
    if (submittedQuestionIds.size !== answers.length) {
      return res.status(400).json({
        message:
          "Duplicate question_id detected. Submit one answer per question",
      });
    }

    for (const qid of submittedQuestionIds) {
      if (!questionIds.includes(qid)) {
        return res.status(400).json({ message: `Invalid question_id: ${qid}` });
      }
    }

    if (submittedQuestionIds.size !== totalQuestions) {
      return res.status(400).json({
        message: `You must answer all questions (${totalQuestions}) exactly once`,
      });
    }

    const selectedOptionIds = answers
      .map((a) => Number(a.selected_option_id))
      .filter(Boolean);

    if (!selectedOptionIds.length) {
      return res
        .status(400)
        .json({ message: "At least one selected_option_id is required" });
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
        return res
          .status(400)
          .json({ message: `Invalid selected_option_id: ${selectedOptionId}` });
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
    const passed = score >= PASSING_SCORE_PERCENT ? 1 : 0;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [latestAttemptRows] = await connection.query(
      `SELECT COALESCE(MAX(attempt_no), 0) AS latest_attempt_no
       FROM quiz_attempts
       WHERE user_id = ?
         AND lesson_id = ?
       FOR UPDATE`,
      [userId, lessonId],
    );

    const attemptNo = Number(latestAttemptRows[0]?.latest_attempt_no || 0) + 1;

    const [insertAttempt] = await connection.query(
      `INSERT INTO quiz_attempts (lesson_id, user_id, score, passed, attempt_no)
       VALUES (?, ?, ?, ?, ?)`,
      [lessonId, userId, score, passed, attemptNo],
    );

    const attemptId = Number(insertAttempt.insertId);

    const answerRows = answers.map((answer) => {
      const selectedOptionId = Number(answer.selected_option_id);
      const questionId = Number(answer.question_id);
      const opt = optionById.get(selectedOptionId);
      return [
        attemptId,
        questionId,
        selectedOptionId,
        Boolean(opt?.is_correct),
      ];
    });

    if (answerRows.length) {
      await connection.query(
        "INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES ?",
        [answerRows],
      );
    }

    await connection.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, completed_at)
       VALUES (?, ?, 'completed', NOW())
       ON DUPLICATE KEY UPDATE
         status = 'completed',
         completed_at = NOW()`,
      [userId, lessonId],
    );

    await connection.commit();

    return res.json({
      success: true,
      score,
      totalQuestions,
      correctCount,
      attemptNo,
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Get quiz review with score percentage and detailed answer feedback
 * Shows correct answers only AFTER submission
 */
exports.getQuizReview = async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({ message: "Invalid lessonId" });
  }

  const userId = req.user?.sub || req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Get latest attempt
    const [attemptRows] = await db.query(
      `SELECT id, score, attempt_no, submitted_at, passed
       FROM quiz_attempts
       WHERE lesson_id = ? AND user_id = ?
       ORDER BY attempt_no DESC, submitted_at DESC
       LIMIT 1`,
      [lessonId, userId],
    );

    if (!attemptRows.length) {
      return res.status(404).json({ message: "No quiz attempt found" });
    }

    const attempt = attemptRows[0];

    // Get questions with all options and correct answers
    const [questions] = await db.query(
      `SELECT q.id, q.question_text, q.question_order,
              o.id AS option_id, o.option_text, o.is_correct
       FROM quiz_questions q
       LEFT JOIN quiz_options o ON o.question_id = q.id
       WHERE q.lesson_id = ?
       ORDER BY q.question_order ASC, o.id ASC`,
      [lessonId],
    );

    // Get user's answers
    const [answers] = await db.query(
      `SELECT question_id, selected_option_id, is_correct
       FROM quiz_answers
       WHERE attempt_id = ?`,
      [attempt.id],
    );

    // Build response with detailed review
    const questionsMap = new Map();
    questions.forEach((row) => {
      if (!questionsMap.has(row.id)) {
        questionsMap.set(row.id, {
          id: row.id,
          text: row.question_text,
          order: row.question_order,
          options: [],
          userAnswer: null,
          isCorrect: null,
        });
      }

      const q = questionsMap.get(row.id);
      if (row.option_id) {
        q.options.push({
          id: row.option_id,
          text: row.option_text,
          isCorrect: Boolean(row.is_correct),
        });
      }
    });

    // Attach user answers to questions
    answers.forEach((ans) => {
      const q = questionsMap.get(ans.question_id);
      if (q) {
        q.userAnswer = ans.selected_option_id;
        q.isCorrect = Boolean(ans.is_correct);
      }
    });

    return res.json({
      success: true,
      data: {
        score: attempt.score,
        attempt: attempt.attempt_no,
        passed: Boolean(attempt.passed),
        submittedAt: attempt.submitted_at,
        questions: Array.from(questionsMap.values()).sort(
          (a, b) => a.order - b.order,
        ),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  }
};

/**
 * Reset quiz attempt - allow student to retake
 * Clears current attempt history for this lesson
 */
exports.resetQuiz = async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({ message: "Invalid lessonId" });
  }

  const userId = req.user?.sub || req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Delete all answers and attempts for this lesson
    const [attempts] = await connection.query(
      `SELECT id FROM quiz_attempts WHERE lesson_id = ? AND user_id = ?`,
      [lessonId, userId],
    );

    if (attempts.length) {
      const attemptIds = attempts.map((a) => a.id);
      await connection.query(
        `DELETE FROM quiz_answers WHERE attempt_id IN (?)`,
        [attemptIds],
      );
    }

    await connection.query(
      `DELETE FROM quiz_attempts WHERE lesson_id = ? AND user_id = ?`,
      [lessonId, userId],
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Quiz reset successfully. You can attempt again.",
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Submit quiz by lesson slug (NEW - security through obscured IDs)
 * Same as submitQuiz but uses slug instead of numeric ID
 */
exports.submitQuizBySlug = async (req, res) => {
  const lessonSlug = String(req.params.lessonSlug).trim();
  if (!lessonSlug || lessonSlug.length === 0) {
    return res.status(400).json({ message: "Invalid lesson slug" });
  }

  const userId = req.user?.sub || req.user?.id;
  const { answers } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ message: "Answers array is required" });
  }

  let connection;

  try {
    // Get lesson ID from slug
    const [lessonData] = await db.query(
      `SELECT id, quiz_deadline FROM lessons WHERE slug = ? LIMIT 1`,
      [lessonSlug],
    );

    if (!lessonData.length) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const lessonId = lessonData[0].id;

    // CHECK DEADLINE
    if (lessonData[0]?.quiz_deadline) {
      const deadline = new Date(lessonData[0].quiz_deadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(403).json({
          message: "Quiz submission deadline has passed",
          deadline: deadline.toISOString(),
        });
      }
    }

    // Rest of the logic is identical to submitQuiz - reuse the main logic
    const [questions] = await db.query(
      `SELECT id FROM quiz_questions WHERE lesson_id = ? ORDER BY question_order ASC, id ASC`,
      [lessonId],
    );

    if (!questions.length) {
      return res.status(404).json({ message: "No quiz found for this lesson" });
    }

    const questionIds = questions.map((q) => Number(q.id));
    const totalQuestions = questionIds.length;

    if (answers.length !== totalQuestions) {
      return res.status(400).json({
        message: `You must answer all questions (${totalQuestions}) exactly once`,
      });
    }

    const submittedQuestionIds = new Set(
      answers.map((a) => Number(a.question_id)),
    );
    if (submittedQuestionIds.size !== answers.length) {
      return res.status(400).json({
        message:
          "Duplicate question_id detected. Submit one answer per question",
      });
    }

    for (const qid of submittedQuestionIds) {
      if (!questionIds.includes(qid)) {
        return res.status(400).json({ message: `Invalid question_id: ${qid}` });
      }
    }

    if (submittedQuestionIds.size !== totalQuestions) {
      return res.status(400).json({
        message: `You must answer all questions (${totalQuestions}) exactly once`,
      });
    }

    const selectedOptionIds = answers
      .map((a) => Number(a.selected_option_id))
      .filter(Boolean);

    if (!selectedOptionIds.length) {
      return res
        .status(400)
        .json({ message: "At least one selected_option_id is required" });
    }

    const [options] = await db.query(
      `SELECT o.id, o.question_id, o.is_correct FROM quiz_options o WHERE o.id IN (?)`,
      [selectedOptionIds],
    );

    const optionById = new Map();
    options.forEach((opt) => optionById.set(Number(opt.id), opt));

    for (const answer of answers) {
      const selectedOptionId = Number(answer.selected_option_id);
      const questionId = Number(answer.question_id);
      const opt = optionById.get(selectedOptionId);

      if (!opt) {
        return res
          .status(400)
          .json({ message: `Invalid selected_option_id: ${selectedOptionId}` });
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
    const passed = score >= 70 ? 1 : 0;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [latestAttemptRows] = await connection.query(
      `SELECT COALESCE(MAX(attempt_no), 0) AS latest_attempt_no FROM quiz_attempts WHERE user_id = ? AND lesson_id = ? FOR UPDATE`,
      [userId, lessonId],
    );

    const attemptNo = Number(latestAttemptRows[0]?.latest_attempt_no || 0) + 1;

    const [insertAttempt] = await connection.query(
      `INSERT INTO quiz_attempts (lesson_id, user_id, score, passed, attempt_no) VALUES (?, ?, ?, ?, ?)`,
      [lessonId, userId, score, passed, attemptNo],
    );

    const attemptId = Number(insertAttempt.insertId);

    const answerRows = answers.map((answer) => {
      const selectedOptionId = Number(answer.selected_option_id);
      const questionId = Number(answer.question_id);
      const opt = optionById.get(selectedOptionId);
      return [
        attemptId,
        questionId,
        selectedOptionId,
        Boolean(opt?.is_correct),
      ];
    });

    if (answerRows.length) {
      await connection.query(
        "INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES ?",
        [answerRows],
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      score,
      totalQuestions,
      correctCount,
      attemptNo,
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Get quiz review by lesson slug (NEW)
 * Shows correct answers only AFTER submission
 */
exports.getQuizReviewBySlug = async (req, res) => {
  const lessonSlug = String(req.params.lessonSlug).trim();
  if (!lessonSlug || lessonSlug.length === 0) {
    return res.status(400).json({ message: "Invalid lesson slug" });
  }

  const userId = req.user?.sub || req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Get lesson ID from slug
    const [lessonData] = await db.query(
      `SELECT id FROM lessons WHERE slug = ? LIMIT 1`,
      [lessonSlug],
    );

    if (!lessonData.length) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const lessonId = lessonData[0].id;

    // Get latest attempt
    const [attemptRows] = await db.query(
      `SELECT id, score, attempt_no, submitted_at, passed FROM quiz_attempts WHERE lesson_id = ? AND user_id = ? ORDER BY attempt_no DESC, submitted_at DESC LIMIT 1`,
      [lessonId, userId],
    );

    if (!attemptRows.length) {
      return res.status(404).json({ message: "No quiz attempt found" });
    }

    const attempt = attemptRows[0];

    // Get questions with all options and correct answers
    const [questions] = await db.query(
      `SELECT q.id, q.question_text, q.question_order, o.id AS option_id, o.option_text, o.is_correct FROM quiz_questions q LEFT JOIN quiz_options o ON o.question_id = q.id WHERE q.lesson_id = ? ORDER BY q.question_order ASC, o.id ASC`,
      [lessonId],
    );

    // Get user's answers
    const [answers] = await db.query(
      `SELECT question_id, selected_option_id, is_correct FROM quiz_answers WHERE attempt_id = ?`,
      [attempt.id],
    );

    // Build response with detailed review
    const questionsMap = new Map();
    questions.forEach((row) => {
      if (!questionsMap.has(row.id)) {
        questionsMap.set(row.id, {
          id: row.id,
          text: row.question_text,
          order: row.question_order,
          options: [],
          userAnswer: null,
          isCorrect: null,
        });
      }

      const q = questionsMap.get(row.id);
      if (row.option_id) {
        q.options.push({
          id: row.option_id,
          text: row.option_text,
          isCorrect: Boolean(row.is_correct),
        });
      }
    });

    // Attach user answers to questions
    answers.forEach((ans) => {
      const q = questionsMap.get(ans.question_id);
      if (q) {
        q.userAnswer = ans.selected_option_id;
        q.isCorrect = Boolean(ans.is_correct);
      }
    });

    return res.json({
      success: true,
      data: {
        score: attempt.score,
        attempt: attempt.attempt_no,
        passed: Boolean(attempt.passed),
        submittedAt: attempt.submitted_at,
        questions: Array.from(questionsMap.values()).sort(
          (a, b) => a.order - b.order,
        ),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  }
};

/**
 * Reset quiz by lesson slug (NEW)
 * Allow student to retake
 */
exports.resetQuizBySlug = async (req, res) => {
  const lessonSlug = String(req.params.lessonSlug).trim();
  if (!lessonSlug || lessonSlug.length === 0) {
    return res.status(400).json({ message: "Invalid lesson slug" });
  }

  const userId = req.user?.sub || req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  let connection;

  try {
    // Get lesson ID from slug
    const [lessonData] = await db.query(
      `SELECT id FROM lessons WHERE slug = ? LIMIT 1`,
      [lessonSlug],
    );

    if (!lessonData.length) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const lessonId = lessonData[0].id;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Delete all answers and attempts for this lesson
    const [attempts] = await connection.query(
      `SELECT id FROM quiz_attempts WHERE lesson_id = ? AND user_id = ?`,
      [lessonId, userId],
    );

    if (attempts.length) {
      const attemptIds = attempts.map((a) => a.id);
      await connection.query(
        `DELETE FROM quiz_answers WHERE attempt_id IN (?)`,
        [attemptIds],
      );
    }

    await connection.query(
      `DELETE FROM quiz_attempts WHERE lesson_id = ? AND user_id = ?`,
      [lessonId, userId],
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Quiz reset successfully. You can attempt again.",
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    return res
      .status(500)
      .json({ message: "Database error", error: err.message || err });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
