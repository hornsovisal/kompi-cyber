const submissionModel = require("../models/Submission");
const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");
const db = require("../config/db");

class ProgressController {
  /**
   * GET /api/progress/courses/:courseId - Teacher views all students' progress in a course
   */
  static async getCourseProgress(req, res) {
    try {
      const courseId = Number(req.params.courseId);
      const teacherId = req.user?.sub;

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Verify teacher owns this course
      const course = await courseModel.findById(courseId);
      if (!course || course.created_by !== teacherId) {
        return res.status(403).json({
          message: "You do not have permission to view this course's progress",
        });
      }

      // Get all students enrolled in the course
      const [enrollments] = await db.execute(
        `SELECT 
          e.id,
          e.user_id,
          e.enrolled_at,
          u.full_name,
          u.email,
          COUNT(DISTINCT s.id) AS submissions_count,
          COUNT(DISTINCT CASE WHEN s.score IS NOT NULL THEN s.id END) AS graded_submissions,
          AVG(s.score) AS average_score
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN submissions s ON e.user_id = s.user_id AND s.course_id = ?
        WHERE e.course_id = ?
        GROUP BY e.user_id
        ORDER BY u.full_name ASC`,
        [courseId, courseId],
      );

      return res.status(200).json({
        success: true,
        data: enrollments,
        courseId,
      });
    } catch (error) {
      console.error("getCourseProgress error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching course progress",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/progress/courses/:courseId/students/:studentId - Teacher views specific student's progress
   */
  static async getStudentProgress(req, res) {
    try {
      const courseId = Number(req.params.courseId);
      const studentId = String(req.params.studentId);
      const teacherId = req.user?.sub;

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Verify teacher owns this course
      const course = await courseModel.findById(courseId);
      if (!course || course.created_by !== teacherId) {
        return res.status(403).json({
          message: "You do not have permission to view this student's progress",
        });
      }

      // Verify student is enrolled
      const [enrollments] = await db.execute(
        `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?`,
        [studentId, courseId],
      );

      if (enrollments.length === 0) {
        return res.status(404).json({
          message: "Student is not enrolled in this course",
        });
      }

      // Get student details
      const [students] = await db.execute(
        `SELECT id, full_name, email FROM users WHERE id = ?`,
        [studentId],
      );

      const student = students[0];

      // Get lessons completed
      const [submissions] = await db.execute(
        `SELECT 
          s.id,
          s.lesson_id,
          l.title AS lesson_title,
          s.score,
          s.submitted_at,
          s.feedback
        FROM submissions s
        JOIN lessons l ON s.lesson_id = l.id
        WHERE s.user_id = ? AND s.course_id = ?
        ORDER BY s.submitted_at DESC`,
        [studentId, courseId],
      );

      // Get course modules for completion tracking
      const [modules] = await db.execute(
        `SELECT 
          m.id,
          m.title,
          m.module_order,
          COUNT(l.id) AS total_lessons,
          COUNT(DISTINCT CASE WHEN EXISTS (
            SELECT 1 FROM submissions WHERE lesson_id = l.id AND user_id = ?
          ) THEN l.id END) AS completed_lessons
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        WHERE m.course_id = ?
        GROUP BY m.id
        ORDER BY m.module_order ASC`,
        [studentId, courseId],
      );

      // Calculate completion percentage
      const totalLessons = submissions.length;
      const completedLessons = submissions.filter(
        (s) => s.score !== null,
      ).length;
      const completionPercentage =
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100);

      return res.status(200).json({
        success: true,
        data: {
          student,
          submissions,
          modules,
          stats: {
            totalSubmissions: submissions.length,
            gradedSubmissions: completedLessons,
            averageScore:
              completedLessons > 0
                ? (
                    submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                    completedLessons
                  ).toFixed(2)
                : 0,
            completionPercentage,
          },
        },
      });
    } catch (error) {
      console.error("getStudentProgress error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching student progress",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/progress/my-progress/:courseId - Student views their own progress
   */
  static async getMyProgress(req, res) {
    try {
      const courseId = Number(req.params.courseId);
      const studentId = req.user?.sub;

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Verify student is enrolled
      const enrolled = await enrollmentModel.isEnrolled(studentId, courseId);
      if (!enrolled) {
        return res.status(403).json({
          message: "You are not enrolled in this course",
        });
      }

      // Get lessons completed by student
      const [submissions] = await db.execute(
        `SELECT 
          s.id,
          s.lesson_id,
          l.title AS lesson_title,
          m.title AS module_title,
          s.score,
          s.submitted_at,
          s.feedback
        FROM submissions s
        JOIN lessons l ON s.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        WHERE s.user_id = ? AND s.course_id = ?
        ORDER BY m.module_order ASC, l.lesson_order ASC`,
        [studentId, courseId],
      );

      // Get course modules for completion tracking
      const [modules] = await db.execute(
        `SELECT 
          m.id,
          m.title,
          m.module_order,
          COUNT(l.id) AS total_lessons,
          COUNT(DISTINCT CASE WHEN EXISTS (
            SELECT 1 FROM submissions WHERE lesson_id = l.id AND user_id = ?
          ) THEN l.id END) AS completed_lessons
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        WHERE m.course_id = ?
        GROUP BY m.id
        ORDER BY m.module_order ASC`,
        [studentId, courseId],
      );

      // Calculate statistics
      const totalSubmissions = submissions.length;
      const gradedSubmissions = submissions.filter(
        (s) => s.score !== null,
      ).length;
      const averageScore =
        gradedSubmissions > 0
          ? (
              submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
              gradedSubmissions
            ).toFixed(2)
          : 0;

      const completionPercentage =
        totalSubmissions === 0
          ? 0
          : Math.round((gradedSubmissions / totalSubmissions) * 100);

      return res.status(200).json({
        success: true,
        data: {
          submissions,
          modules,
          stats: {
            totalSubmissions,
            gradedSubmissions,
            averageScore,
            completionPercentage,
          },
        },
      });
    } catch (error) {
      console.error("getMyProgress error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching your progress",
        error: error.message,
      });
    }
  }
}

module.exports = ProgressController;
