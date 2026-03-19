// backend/models/courseModel.js

const db = require("../config/db");

const courseModel = {
  // Get one course from DB
  async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM courses WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  // Get all courses from DB
  async findAll() {
    const [rows] = await db.execute("SELECT * FROM courses");
    return rows;
  },

  // Create course
  async createCourse(data) {
    const {
      title,
      description,
      level,
      duration_hrs
    } = data;

    const [result] = await db.execute(
      `INSERT INTO courses (title, description, level, duration_hrs)
       VALUES (?, ?, ?, ?)`,
      [title, description, level, duration_hrs]
    );

    return result.insertId;
  },

  // Update course
  async updateCourse(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    const values = Object.values(fields);
    const setClause = keys.map(key => `${key} = ?`).join(", ");

    const [result] = await db.execute(
      `UPDATE courses SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    return result.affectedRows > 0;
  },

  // Delete course
  async deleteCourse(id) {
    await db.execute("DELETE FROM courses WHERE id = ?", [id]);
  },

  // Get lessons from DB (if you have lessons table)
  async getLessonsByCourse(courseId) {
    const [rows] = await db.execute(
      "SELECT * FROM lessons WHERE course_id = ?",
      [courseId]
    );
    return rows;
  },

  async ensureSeedFromUploadIfEmpty() {
    return;
  }
};

module.exports = courseModel;