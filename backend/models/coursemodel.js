const db = require("../db");

const courseModel = {
  // Get all courses (with optional search by title)
  getAllCourses: async (search = "") => {
    if (search) {
      const [rows] = await db.query(
        `SELECT id, title, description, instructor_id, created_at
         FROM courses
         WHERE title LIKE ?
         ORDER BY created_at DESC`,
        [`%${search}%`]
      );
      return rows;
    }

    const [rows] = await db.query(
      `SELECT id, title, description, instructor_id, created_at
       FROM courses
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // Get a single course by ID
  getCourseById: async (id) => {
    const [rows] = await db.query(
      `SELECT id, title, description, instructor_id, created_at
       FROM courses
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Get courses belonging to a specific instructor
  getCoursesByInstructor: async (instructorId) => {
    const [rows] = await db.query(
      `SELECT id, title, description, instructor_id, created_at
       FROM courses
       WHERE instructor_id = ?
       ORDER BY created_at DESC`,
      [instructorId]
    );
    return rows;
  },
};

module.exports = courseModel;