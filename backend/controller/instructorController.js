const db = require('../config/db');
const LecturerModel = require('../models/IntructorModel');

// In-memory quiz store for quick demo / no database mode
let quizMemory = [];

// Mock student performance data
const mockStudents = [
  { id: 101, name: 'Alice Nguyen', course: 'network-security', scores: [{ quizId: 1, score: 90 }, { quizId: 2, score: 85 }] },
  { id: 102, name: 'Sok Chenda', course: 'web-security', scores: [{ quizId: 3, score: 76 }, { quizId: 4, score: 88 }] },
  { id: 103, name: 'Maya Soth', course: 'incident-response', scores: [{ quizId: 5, score: 92 }, { quizId: 6, score: 81 }] },
  { id: 104, name: 'Vincent Lim', course: 'intro-to-linux-course', scores: [{ quizId: 7, score: 84 }, { quizId: 8, score: 79 }] },
  { id: 105, name: 'Student A', course: 'intro-to-cyber-course', scores: [{ quizId: 9, score: 88 }] },
];

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
    // Return mock data for testing when database is not available
    console.log('Database not available, returning mock course data');
    const mockCourses = [
      {
        id: 1,
        title: "Introduction to Cybersecurity",
        description: "Learn the fundamentals of cybersecurity",
        level: "beginner",
        duration: 10,
        status: "published",
        enrollmentCount: 25,
        quizCount: 0,
        moduleCount: 3
      },
      {
        id: 2,
        title: "Network Security Fundamentals", 
        description: "Master network security concepts",
        level: "intermediate",
        duration: 15,
        status: "published",
        enrollmentCount: 18,
        quizCount: 0,
        moduleCount: 4
      },
      {
        id: 3,
        title: "Web Security Essentials",
        description: "Protect web applications from threats",
        level: "intermediate", 
        duration: 12,
        status: "draft",
        enrollmentCount: 0,
        quizCount: 0,
        moduleCount: 2
      }
    ];
    
    res.json({
      success: true,
      data: mockCourses,
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

// Instructor-specific dashboard (required route)
const getInstructorDashboard = async (req, res) => {
  try {
    const lecturerId = req.user.id || req.user.sub;

    const lecturer = await LecturerModel.findLecturerById(lecturerId);
    if (!lecturer) {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    const lecturerQuizzes = quizMemory.filter((q) => q.createdBy === lecturer.id);
    const totalStudents = mockStudents.filter((s) => lecturer.courses.includes(s.course)).length;

    const quizScores = mockStudents
      .flatMap((s) => s.scores.filter((score) => lecturerQuizzes.some((q) => q.id === score.quizId)))
      .map((item) => item.score);

    const averageScore = quizScores.length ? Number((quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(2)) : 0;

    const upcomingQuizzes = lecturerQuizzes
      .filter((q) => new Date(`${q.dueDate}T${q.dueTime}`).getTime() > Date.now())
      .sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}`) - new Date(`${b.dueDate}T${b.dueTime}`));

    return res.json({
      success: true,
      data: {
        lecturer: {
          id: lecturer.id,
          name: lecturer.name,
          email: lecturer.email,
          department: lecturer.department,
          courses: lecturer.courses,
        },
        totals: {
          totalStudents,
          averageScore,
          totalQuizzes: lecturerQuizzes.length,
        },
        upcomingQuizzes,
      },
    });
  } catch (error) {
    console.error('Error fetching instructor dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructor dashboard' });
  }
};

const getStudentPerformance = async (req, res) => {
  try {
    const lecturerId = req.user.id || req.user.sub;
    const { course } = req.query;
    const lecturer = await LecturerModel.findLecturerById(lecturerId);

    if (!lecturer) {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    const students = mockStudents.filter((student) => {
      const belongsToLecturer = lecturer.courses.includes(student.course);
      const matchesCourse = course ? String(student.course) === String(course) : true;
      return belongsToLecturer && matchesCourse;
    });

    const performance = students.map((student) => {
      const average = student.scores.length
        ? Number((student.scores.reduce((sum, s) => sum + s.score, 0) / student.scores.length).toFixed(2))
        : 0;
      return {
        ...student,
        averageScore: average,
      };
    });

    const totalStudents = performance.length;
    const averageScore = totalStudents
      ? Number((performance.reduce((sum, student) => sum + student.averageScore, 0) / totalStudents).toFixed(2))
      : 0;

    return res.json({
      success: true,
      data: {
        totalStudents,
        averageScore,
        selectedCourse: course || null,
        students: performance,
      },
    });
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student performance' });
  }
};

const createQuizForInstructor = async (req, res) => {
  try {
    const lecturerId = req.user.id || req.user.sub;
    const { title, description, course, dueDate, dueTime } = req.body;

    if (!title || !description || !course || !dueDate || !dueTime) {
      return res.status(400).json({ success: false, message: 'Missing quiz fields' });
    }

    const lecturer = await LecturerModel.findLecturerById(lecturerId);
    if (!lecturer) {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    if (!lecturer.courses.includes(course)) {
      return res.status(403).json({ success: false, message: 'Cannot assign quiz to this course' });
    }

    const newQuiz = {
      id: quizMemory.length ? Math.max(...quizMemory.map((q) => q.id)) + 1 : 1,
      title,
      description,
      course,
      dueDate,
      dueTime,
      createdBy: lecturer.id,
      createdAt: new Date().toISOString(),
    };

    quizMemory.push(newQuiz);

    res.status(201).json({ success: true, data: newQuiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz' });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const lecturerId = req.user.id || req.user.sub;
    const quizzes = quizMemory.filter((q) => q.createdBy === lecturerId);
    res.json({ success: true, data: quizzes });
  } catch (error) {
    console.error('Error fetching my quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
};

const updateQuizById = async (req, res) => {
  try {
    const lecturerId = req.user.id || req.user.sub;
    const quizId = Number(req.params.id);
    const { title, description, course, dueDate, dueTime } = req.body;

    const quizIndex = quizMemory.findIndex((q) => q.id === quizId && q.createdBy === lecturerId);
    if (quizIndex === -1) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const updatedQuiz = {
      ...quizMemory[quizIndex],
      title: title ?? quizMemory[quizIndex].title,
      description: description ?? quizMemory[quizIndex].description,
      course: course ?? quizMemory[quizIndex].course,
      dueDate: dueDate ?? quizMemory[quizIndex].dueDate,
      dueTime: dueTime ?? quizMemory[quizIndex].dueTime,
      updatedAt: new Date().toISOString(),
    };

    quizMemory[quizIndex] = updatedQuiz;
    res.json({ success: true, data: updatedQuiz });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz' });
  }
};

const deleteQuizById = async (req, res) => {
  try {
    const lecturerId = req.user.id || req.user.sub;
    const quizId = Number(req.params.id);

    const quizIndex = quizMemory.findIndex((q) => q.id === quizId && q.createdBy === lecturerId);
    if (quizIndex === -1) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    quizMemory.splice(quizIndex, 1);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Instructor login
const loginInstructor = async (req, res) => {
  console.log('loginInstructor called with:', req.body);
  try {
    const { email, password } = req.body;

    // Find lecturer by email
    const lecturers = await LecturerModel.findLecturerByEmail(email);
    if (lecturers.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const lecturer = lecturers[0];

    console.log('Lecturer found:', lecturer);
    console.log('isVerified:', lecturer.isVerified);

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, lecturer.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Check if verified
    // TEMP: Bypass verification for testing
    // if (!lecturer.isVerified) {
    //   return res.status(403).json({
    //     message: 'Account not verified. Please check your email.',
    //     requiresVerification: true,
    //     instructor: {
    //       id: lecturer.id,
    //       name: lecturer.name,
    //       email: lecturer.email,
    //       department: lecturer.department,
    //       employeeId: lecturer.employeeId,
    //     }
    //   });
    // }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: lecturer.id,
        id: lecturer.id,
        email: lecturer.email,
        role: 'instructor',
        department: lecturer.department,
        employeeId: lecturer.employeeId,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      instructor: {
        id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
        department: lecturer.department,
        courses: lecturer.courses,
        employeeId: lecturer.employeeId,
        isVerified: lecturer.isVerified,
      },
    });
  } catch (error) {
    console.error('Instructor login error:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// Send OTP for instructor verification
const sendInstructorOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const lecturers = await LecturerModel.findLecturerByEmail(email);
    if (lecturers.length === 0) {
      return res.status(404).json({
        message: 'Instructor not found',
      });
    }

    const lecturer = lecturers[0];

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (in production, use Redis or similar)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await LecturerModel.updateLecturerVerification(lecturer.id, false, verificationToken);

    // Send email with OTP
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@kompi-cyber.com',
      to: lecturer.email,
      subject: 'Verify Your Instructor Account - Kompi-Cyber',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Kompi-Cyber</h1>
            <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">Instructor Portal</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Welcome ${lecturer.name}!</h2>
            <p style="color: #666; line-height: 1.6;">Your instructor account has been created. To complete the verification process, please use the following 6-digit code:</p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; font-family: 'Courier New', monospace; letter-spacing: 4px;">${otp}</span>
              </div>
            </div>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">This verification code will expire in 10 minutes.</p>

            <p style="color: #999; font-size: 14px; margin-top: 30px;">If you didn't create an instructor account, please ignore this email.</p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Kompi-Cyber Cybersecurity Learning Platform</p>
          </div>
        </div>
      `
    };

    try {
      await emailService.sendVerificationEmail(lecturer.email, verificationToken);
      // Note: In a real implementation, you'd store the OTP securely
      // For demo, we'll return it in response for testing
      res.json({
        success: true,
        message: 'Verification code sent to your email',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only show in dev
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({
        message: 'Failed to send verification email',
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

// Verify instructor OTP
const verifyInstructorOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const lecturers = await LecturerModel.findLecturerByEmail(email);
    if (lecturers.length === 0) {
      return res.status(404).json({
        message: 'Instructor not found',
      });
    }

    const lecturer = lecturers[0];

    // In a real implementation, you'd verify the OTP from secure storage
    // For demo, we'll accept any 6-digit code
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: 'Invalid verification code',
      });
    }

    // Mark as verified
    await LecturerModel.updateLecturerVerification(lecturer.id, true, null);

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: lecturer.id,
        id: lecturer.id,
        email: lecturer.email,
        role: 'instructor',
        department: lecturer.department,
        employeeId: lecturer.employeeId,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      instructor: {
        id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
        department: lecturer.department,
        courses: lecturer.courses,
        employeeId: lecturer.employeeId,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  loginInstructor,
  sendInstructorOTP,
  verifyInstructorOTP,
  getInstructorCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  getDashboardStats,
  getInstructorDashboard,
  getStudentPerformance,
  createQuizForInstructor,
  getMyQuizzes,
  updateQuizById,
  deleteQuizById,
};



