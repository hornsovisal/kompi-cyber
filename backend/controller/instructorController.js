const db = require('../config/db');

// Get all instructor's courses with stats
const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.level,
        c.duration,
        c.status,
        COUNT(DISTINCT e.id) as enrollmentCount,
        COUNT(DISTINCT q.id) as quizCount,
        COUNT(DISTINCT m.id) as moduleCount
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN quizzes q ON c.id = q.course_id
      LEFT JOIN modules m ON c.id = m.course_id
      WHERE c.created_by = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    const [courses] = await db.execute(query, [instructorId]);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
    });
  }
};

// Get single course details
const getCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) as enrollmentCount,
        COUNT(DISTINCT q.id) as quizCount,
        COUNT(DISTINCT m.id) as moduleCount
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN quizzes q ON c.id = q.course_id
      LEFT JOIN modules m ON c.id = m.course_id
      WHERE c.id = ? AND c.created_by = ?
      GROUP BY c.id
    `;

    const [courses] = await db.execute(query, [id, instructorId]);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: courses[0],
    });
  } catch (error) {
    console.error('Error fetching course detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
    });
  }
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const { title, description, level, duration } = req.body;
    const instructorId = req.user.id;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const query = `
      INSERT INTO courses (title, description, level, duration, created_by, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'draft', NOW(), NOW())
    `;

    const [result] = await db.execute(query, [
      title,
      description,
      level || 'Beginner',
      duration || '4 weeks',
      instructorId,
    ]);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        id: result.insertId,
        title,
        description,
      },
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
    });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level, duration, status } = req.body;
    const instructorId = req.user.id;

    // Check if course belongs to instructor
    const [courses] = await db.execute(
      'SELECT id FROM courses WHERE id = ? AND created_by = ?',
      [id, instructorId]
    );

    if (courses.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    const query = `
      UPDATE courses 
      SET title = ?, description = ?, level = ?, duration = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(query, [title, description, level, duration, status, id]);

    res.json({
      success: true,
      message: 'Course updated successfully',
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    // Check if course belongs to instructor
    const [courses] = await db.execute(
      'SELECT id FROM courses WHERE id = ? AND created_by = ?',
      [id, instructorId]
    );

    if (courses.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    await db.execute('DELETE FROM courses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
    });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // Get total courses
    const coursesQuery = 'SELECT COUNT(*) as count FROM courses WHERE created_by = ?';
    const [coursesResult] = await db.execute(coursesQuery, [instructorId]);

    // Get total students enrolled
    const studentsQuery = `
      SELECT COUNT(DISTINCT e.user_id) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.created_by = ?
    `;
    const [studentsResult] = await db.execute(studentsQuery, [instructorId]);

    // Get total quizzes
    const quizzesQuery = `
      SELECT COUNT(*) as count 
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE c.created_by = ?
    `;
    const [quizzesResult] = await db.execute(quizzesQuery, [instructorId]);

    res.json({
      success: true,
      data: {
        totalCourses: coursesResult[0].count,
        totalStudents: studentsResult[0].count,
        totalQuizzes: quizzesResult[0].count,
        completionRate: 0, // Calculate from lesson_progress
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
    });
  }
};

module.exports = {
  getInstructorCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  getDashboardStats,
};
