const db = require("../config/db");

// Data-access layer for enrollments.
class EnrollmentModel {
  constructor(database) {
    this.db = database;
  }

  async enroll(userId, courseId) {
    const [result] = await this.db.execute(
      `INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)`,
      [userId, courseId],
    );
    return result;
  }

  async isEnrolled(userId, courseId) {
    // Fast existence check used by access-control guards.
    const [rows] = await this.db.execute(
      `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1`,
      [userId, courseId],
    );
    return rows.length > 0;
  }

  async getByUserId(userId) {
    const [rows] = await this.db.execute(
      `SELECT e.id, e.course_id, e.enrolled_at,
              c.title, c.description, c.level, c.duration_hrs
       FROM enrollments e
       INNER JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
      [userId],
    );
    return rows;
  }

  async unenroll(userId, courseId) {
    const [result] = await this.db.execute(
      `DELETE FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [userId, courseId],
    );
    return result;
  }
}

module.exports = new EnrollmentModel(db);
