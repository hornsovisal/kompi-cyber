/**
 * rbacQuizController.js
 * Handles quiz management for the RBAC system.
 *
 * INSTRUCTOR only:
 *   - createQuiz
 *   - openQuiz
 *   - closeQuiz
 *   - getQuizzesByCourse
 */

const RbacQuizModel   = require('../models/rbacQuizModel');
const RbacCourseModel = require('../models/rbacCourseModel');

// ── HELPER ───────────────────────────────────────────────────────────────────

/**
 * Verify that the requesting instructor is assigned to the course.
 * Coordinators bypass this check.
 */
async function assertCourseAccess(req, courseId) {
  if (req.user.role === 'coordinator') return true;

  const course = await RbacCourseModel.getCourseById(courseId);
  if (!course) return false;
  return course.instructors.includes(req.user.employeeId);
}

// ── ENDPOINTS ────────────────────────────────────────────────────────────────

/**
 * POST /api/rbac/quizzes
 * Create a new quiz for an assigned course.
 * Body: { title, courseId, dueDate, dueTime }
 */
const createQuiz = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, dueTime } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ success: false, message: 'title and courseId are required.' });
    }

    const hasAccess = await assertCourseAccess(req, courseId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    const quiz = await RbacQuizModel.createQuiz({
      title: title.trim(),
      description: description?.trim() || '',
      courseId,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      createdBy: req.user.employeeId,
    });

    return res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    console.error('[rbacQuizController] createQuiz error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create quiz.' });
  }
};

/**
 * GET /api/rbac/quizzes/:id
 * Fetch a single quiz if the requester has course access.
 */
const getQuizById = async (req, res) => {
  try {
    const quiz = await RbacQuizModel.getById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const hasAccess = await assertCourseAccess(req, quiz.courseId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    return res.json({ success: true, data: quiz });
  } catch (err) {
    console.error('[rbacQuizController] getQuizById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch quiz.' });
  }
};

/**
 * PUT /api/rbac/quizzes/:id
 * Update an existing quiz.
 */
const updateQuiz = async (req, res) => {
  try {
    const quiz = await RbacQuizModel.getById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    if (req.user.role === 'instructor' && quiz.createdBy !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only update your own quizzes.' });
    }

    const targetCourseId = req.body.courseId || quiz.courseId;
    const hasAccess = await assertCourseAccess(req, targetCourseId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    const updated = await RbacQuizModel.updateQuiz(req.params.id, req.body);
    return res.json({ success: true, data: updated, message: 'Quiz updated successfully.' });
  } catch (err) {
    console.error('[rbacQuizController] updateQuiz error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update quiz.' });
  }
};

/**
 * DELETE /api/rbac/quizzes/:id
 * Delete a quiz.
 */
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await RbacQuizModel.getById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    if (req.user.role === 'instructor' && quiz.createdBy !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own quizzes.' });
    }

    await RbacQuizModel.deleteQuiz(req.params.id);
    return res.json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (err) {
    console.error('[rbacQuizController] deleteQuiz error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete quiz.' });
  }
};

/**
 * GET /api/rbac/quizzes/course/:courseId
 * Get all quizzes for a specific course.
 */
const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const hasAccess = await assertCourseAccess(req, courseId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    const quizzes = await RbacQuizModel.getByCourse(courseId);
    return res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error('[rbacQuizController] getQuizzesByCourse error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch quizzes.' });
  }
};

/**
 * GET /api/rbac/quizzes/my
 * Get all quizzes created by the current instructor.
 */
const getMyQuizzes = async (req, res) => {
  try {
    let quizzes;
    if (req.user.role === 'coordinator') {
      // Coordinators can see all quizzes
      quizzes = await RbacQuizModel.getAllQuizzes();
    } else {
      quizzes = await RbacQuizModel.getByInstructor(req.user.employeeId);
    }
    return res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error('[rbacQuizController] getMyQuizzes error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch quizzes.' });
  }
};

/**
 * PUT /api/rbac/quizzes/:id/open
 * Open a quiz — only the instructor who created it (or a coordinator).
 */
const openQuiz = async (req, res) => {
  try {
    const quiz = await RbacQuizModel.getById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    // Instructors can only manage their own quizzes
    if (req.user.role === 'instructor' && quiz.createdBy !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only manage your own quizzes.' });
    }

    const updated = await RbacQuizModel.openQuiz(req.params.id);
    return res.json({ success: true, data: updated, message: 'Quiz is now open.' });
  } catch (err) {
    console.error('[rbacQuizController] openQuiz error:', err);
    return res.status(500).json({ success: false, message: 'Failed to open quiz.' });
  }
};

/**
 * PUT /api/rbac/quizzes/:id/close
 * Close a quiz — only the instructor who created it (or a coordinator).
 */
const closeQuiz = async (req, res) => {
  try {
    const quiz = await RbacQuizModel.getById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    if (req.user.role === 'instructor' && quiz.createdBy !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only manage your own quizzes.' });
    }

    const updated = await RbacQuizModel.closeQuiz(req.params.id);
    return res.json({ success: true, data: updated, message: 'Quiz is now closed.' });
  } catch (err) {
    console.error('[rbacQuizController] closeQuiz error:', err);
    return res.status(500).json({ success: false, message: 'Failed to close quiz.' });
  }
};

module.exports = { createQuiz, getQuizById, updateQuiz, deleteQuiz, getQuizzesByCourse, getMyQuizzes, openQuiz, closeQuiz };
