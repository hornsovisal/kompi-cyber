const db = require('../config/db');

exports.submitQuiz = (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id;
  const { answers } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ message: 'Answers array is required' });
  }

  // Get all questions for lesson
  db.query(
    'SELECT id FROM quiz_questions WHERE lesson_id = ?',
    [lessonId],
    (err, questions) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (!questions.length) {
        return res.status(404).json({ message: 'No quiz found for this lesson' });
      }

      const questionIds = questions.map((q) => q.id);
      const totalQuestions = questionIds.length;

      // Validate submitted answers
      const submittedQuestionIds = new Set(answers.map((a) => a.question_id));
      for (const qid of submittedQuestionIds) {
        if (!questionIds.includes(qid)) {
          return res.status(400).json({ message: `Invalid question_id: ${qid}` });
        }
      }

      const selectedOptionIds = answers.map((a) => a.selected_option_id).filter(Boolean);
      if (!selectedOptionIds.length) {
        return res.status(400).json({ message: 'At least one selected_option_id is required' });
      }

      // Fetch option correctness
      const optionSql = `
        SELECT o.id, o.question_id, o.is_correct
        FROM quiz_options o
        WHERE o.id IN (?)
      `;

      db.query(optionSql, [selectedOptionIds], (err2, options) => {
        if (err2) return res.status(500).json({ message: 'Database error', error: err2 });

        const optionById = new Map();
        options.forEach((opt) => optionById.set(opt.id, opt));

        // Validate each submitted answer
        for (const answer of answers) {
          const opt = optionById.get(answer.selected_option_id);
          if (!opt) {
            return res.status(400).json({ message: `Invalid selected_option_id: ${answer.selected_option_id}` });
          }
          if (opt.question_id !== answer.question_id) {
            return res.status(400).json({
              message: `Option ${answer.selected_option_id} does not belong to question ${answer.question_id}`,
            });
          }
        }

        // Grade
        const correctCount = answers.reduce((count, answer) => {
          const opt = optionById.get(answer.selected_option_id);
          return count + (opt?.is_correct ? 1 : 0);
        }, 0);

        const score = Math.round((correctCount / totalQuestions) * 100);

        // Upsert attempt
        const attemptSelectSql = `
          SELECT id, attempt_no
          FROM quiz_attempts
          WHERE user_id = ? AND lesson_id = ?
        `;

        db.query(attemptSelectSql, [userId, lessonId], (err3, existing) => {
          if (err3) return res.status(500).json({ message: 'Database error', error: err3 });

          const attemptNo = existing.length ? existing[0].attempt_no + 1 : 1;

          const finish = (attemptId) => {
            // Replace answers for this attempt
            db.query('DELETE FROM quiz_answers WHERE attempt_id = ?', [attemptId], (errDel) => {
              if (errDel) return res.status(500).json({ message: 'Database error', error: errDel });

              const rows = answers.map((answer) => {
                const opt = optionById.get(answer.selected_option_id);
                return [
                  attemptId,
                  answer.question_id,
                  answer.selected_option_id,
                  !!opt?.is_correct,
                ];
              });

              if (!rows.length) {
                return res.json({ success: true, score, totalQuestions, correctCount, attemptNo });
              }

              db.query(
                'INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES ?',
                [rows],
                (errIns) => {
                  if (errIns) return res.status(500).json({ message: 'Database error', error: errIns });
                  res.json({ success: true, score, totalQuestions, correctCount, attemptNo });
                }
              );
            });
          };

          if (existing.length) {
            const attemptId = existing[0].id;
            db.query(
              'UPDATE quiz_attempts SET score = ?, attempt_no = ?, submitted_at = NOW() WHERE id = ?',
              [score, attemptNo, attemptId],
              (errUpd) => {
                if (errUpd) return res.status(500).json({ message: 'Database error', error: errUpd });
                finish(attemptId);
              }
            );
          } else {
            db.query(
              'INSERT INTO quiz_attempts (lesson_id, user_id, score, attempt_no) VALUES (?, ?, ?, ?)',
              [lessonId, userId, score, attemptNo],
              (errIns, result) => {
                if (errIns) return res.status(500).json({ message: 'Database error', error: errIns });
                finish(result.insertId);
              }
            );
          }
        });
      });
    }
  );
};
