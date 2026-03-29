/**
 * Instructor Quiz Controller
 * Handles CRUD for quizzes created by authenticated instructors.
 * Uses InstructorQuizModel (in-memory) — swap model methods for DB calls later.
 *
 * Routes expected:
 *   POST   /api/instructor/quizzes        -> createQuiz
 *   GET    /api/instructor/quizzes/:id    -> getQuizById
 *   PUT    /api/instructor/quizzes/:id    -> updateQuiz
 *   DELETE /a *   GET    /api/instructor/quizzes        -> getMyQuizzes
pi/instructor/quizzes/:id    -> deleteQuiz
 */

const QuizModel = require('../models/InstructorQuizModel');

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/**
 * Resolve lecturer id from the JWT payload.
 * Supports both { id } and { sub } because different sign() calls use both.
 */
const getLecturerId = (user) => user?.id ?? user?.sub;

/* ─── POST /api/instructor/quizzes ────────────────────────────────────────── */
const createQuiz = (req, res) => {
  const { title, description, course, dueDate, dueTime } = req.body;

  // Validate required fields
  if (!title || !course || !dueDate || !dueTime) {
    return res.status(400).json({
      success: false,
      message: 'title, course, dueDate, and dueTime are required',
    });
  }

  const lecturerId = getLecturerId(req.user);
  if (!lecturerId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const quiz = QuizModel.create({
    title: title.trim(),
    description: description?.trim() ?? '',
    course: course.trim(),
    dueDate,
    dueTime,
    createdBy: lecturerId,
  });

  return res.status(201).json({ success: true, data: quiz });
};

/* ─── GET /api/instructor/quizzes ─────────────────────────────────────────── */
const getMyQuizzes = (req, res) => {
  const lecturerId = getLecturerId(req.user);
  if (!lecturerId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const quizzes = QuizModel.findByLecturer(lecturerId);
  return res.json({ success: true, data: quizzes });
};

/* ─── GET /api/instructor/quizzes/:id ─────────────────────────────────────── */
const getQuizById = (req, res) => {
  const lecturerId = getLecturerId(req.user);
  const quiz = QuizModel.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }

  // Instructors may only view their own quizzes
  if (String(quiz.createdBy) !== String(lecturerId)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  return res.json({ success: true, data: quiz });
};

/* ─── PUT /api/instructor/quizzes/:id ─────────────────────────────────────── */
const updateQuiz = (req, res) => {
  const lecturerId = getLecturerId(req.user);
  const quiz = QuizModel.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }

  if (String(quiz.createdBy) !== String(lecturerId)) {
    return res.status(403).json({ success: false, message: 'Forbidden — not your quiz' });
  }

  const { title, description, course, dueDate, dueTime } = req.body;
  const updated = QuizModel.update(req.params.id, { title, description, course, dueDate, dueTime });

  return res.json({ success: true, data: updated });
};

/* ─── DELETE /api/instructor/quizzes/:id ──────────────────────────────────── */
const deleteQuiz = (req, res) => {
  const lecturerId = getLecturerId(req.user);
  const quiz = QuizModel.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found' });
  }

  if (String(quiz.createdBy) !== String(lecturerId)) {
    return res.status(403).json({ success: false, message: 'Forbidden — not your quiz' });
  }

  QuizModel.remove(req.params.id);
  return res.json({ success: true, message: 'Quiz deleted successfully' });
};

module.exports = { createQuiz, getMyQuizzes, getQuizById, updateQuiz, deleteQuiz };
