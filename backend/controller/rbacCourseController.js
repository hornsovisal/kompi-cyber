/**
 * rbacCourseController.js
 * Handles course management with strict role-based permissions.
 *
 * COORDINATOR: createCourse, getAllCourses, assignInstructor
 * INSTRUCTOR:  getMyCourses, inviteStudent, getCourseStudents
 * BOTH:        getCourseById
 */

const RbacCourseModel  = require('../models/rbacCourseModel');
const StudentModel     = require('../models/studentModel');
const LecturerModel    = require('../models/IntructorModel');

// ── COORDINATOR ONLY ─────────────────────────────────────────────────────────

/**
 * POST /api/rbac/courses
 * Create a new course. Only program coordinators may do this.
 */
const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const course = await RbacCourseModel.createCourse({
      title: title.trim(),
      description: description.trim(),
      createdBy: req.user.employeeId,
    });

    return res.status(201).json({ success: true, data: course });
  } catch (err) {
    console.error('[rbacCourseController] createCourse error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
};

/**
 * GET /api/rbac/courses
 * Coordinators see all courses; instructors see only their assigned courses.
 */
const getAllCourses = async (req, res) => {
  try {
    let courses;

    if (req.user.role === 'coordinator') {
      courses = await RbacCourseModel.getAllCourses();
    } else {
      // Instructor: only courses they are assigned to
      courses = await RbacCourseModel.getCoursesByInstructor(req.user.employeeId);
    }

    // Enrich each course with instructor names
    const allInstructors = await LecturerModel.getAllInstructors();

    const enriched = courses.map(course => ({
      ...course,
      instructorDetails: allInstructors.filter(i => course.instructors.includes(i.employeeId)),
      studentCount: course.students.length,
    }));

    return res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('[rbacCourseController] getAllCourses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
};

/**
 * GET /api/rbac/courses/:id
 * Get a single course. Instructors can only access courses they are assigned to.
 */
const getCourseById = async (req, res) => {
  try {
    const course = await RbacCourseModel.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Instructors cannot view courses they are not assigned to
    if (req.user.role === 'instructor' && !course.instructors.includes(req.user.employeeId)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    return res.json({ success: true, data: course });
  } catch (err) {
    console.error('[rbacCourseController] getCourseById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch course.' });
  }
};

/**
 * POST /api/rbac/courses/assign-instructor
 * Assign an instructor to a course. Coordinator only.
 * Body: { courseId, instructorEmployeeId }
 */
const assignInstructor = async (req, res) => {
  try {
    const { courseId, instructorEmployeeId } = req.body;

    if (!courseId || !instructorEmployeeId) {
      return res.status(400).json({ success: false, message: 'courseId and instructorEmployeeId are required.' });
    }

    // Verify instructor exists and has the correct role
    const instructor = await LecturerModel.findLecturerByEmployeeId(instructorEmployeeId);
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }
    if (instructor.role !== 'instructor') {
      return res.status(400).json({ success: false, message: 'Target user is not an instructor.' });
    }

    const course = await RbacCourseModel.assignInstructor(courseId, instructorEmployeeId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Also keep the LecturerModel in sync (in-memory)
    await LecturerModel.assignCourseToInstructor(instructor.id, courseId);

    return res.json({ success: true, data: course, message: `${instructor.name} has been assigned to the course.` });
  } catch (err) {
    console.error('[rbacCourseController] assignInstructor error:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign instructor.' });
  }
};

// ── INSTRUCTOR ONLY ──────────────────────────────────────────────────────────

/**
 * POST /api/rbac/courses/:courseId/invite-student
 * Instructor invites a student to their course by email.
 * Body: { email, name? }
 */
const inviteStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Student email is required.' });
    }

    // Verify instructor is assigned to this course
    const course = await RbacCourseModel.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (!course.instructors.includes(req.user.employeeId)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    // Add student via StudentModel, then add to course
    const student = StudentModel.inviteStudent(email.trim().toLowerCase(), name, courseId);
    await RbacCourseModel.addStudent(courseId, student.id);

    return res.status(201).json({
      success: true,
      data: student,
      message: `${student.name} has been invited to the course.`,
    });
  } catch (err) {
    console.error('[rbacCourseController] inviteStudent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to invite student.' });
  }
};

/**
 * GET /api/rbac/courses/:courseId/students
 * List students in a course.
 * Instructors can only list students in their assigned courses.
 */
const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await RbacCourseModel.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Instructors must be assigned to the course
    if (req.user.role === 'instructor' && !course.instructors.includes(req.user.employeeId)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    const students = StudentModel.findByCourse(courseId);
    return res.json({ success: true, data: students });
  } catch (err) {
    console.error('[rbacCourseController] getCourseStudents error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
};

/**
 * GET /api/rbac/instructors
 * List all instructors (used by coordinator to pick who to assign).
 * Coordinator only.
 */
const listInstructors = async (req, res) => {
  try {
    const instructors = await LecturerModel.getAllInstructors();
    return res.json({ success: true, data: instructors });
  } catch (err) {
    console.error('[rbacCourseController] listInstructors error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch instructors.' });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  assignInstructor,
  inviteStudent,
  getCourseStudents,
  listInstructors,
};
