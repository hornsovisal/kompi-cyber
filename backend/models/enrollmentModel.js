const db = require("../config/db");

const enrollmentModel = {
  async enroll(userId, courseId) {
    await db.execute(
      "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );
  },

  async isEnrolled(userId, courseId) {
    const [rows] = await db.execute(
      "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );
    return rows.length > 0;
  }
};

module.exports = enrollmentModel;