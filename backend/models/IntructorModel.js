// In-memory lecturer storage for demonstration
let lecturers = [
  // ── INSTRUCTORS ──────────────────────────────────────────────────
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@cadt.edu.kh",
    password: "$2b$10$5dsBBzGK8Z.6LMkXntRbtu6kYbEQCI.OGXNiOho..A4HmQ3CMmtsu", // password123
    department: "Network Security",
    courses: ["network-security"],
    employeeId: "LEC001",
    role: "instructor",
    isVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date("2024-01-15")
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    email: "michael.chen@cadt.edu.kh",
    password: "$2b$10$5dsBBzGK8Z.6LMkXntRbtu6kYbEQCI.OGXNiOho..A4HmQ3CMmtsu", // password123
    department: "Web Security",
    courses: ["web-security"],
    employeeId: "LEC002",
    role: "instructor",
    isVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date("2024-02-01")
  },
  {
    id: 3,
    name: "Dr. Lisa Rodriguez",
    email: "lisa.rodriguez@cadt.edu.kh",
    password: "$2b$10$5dsBBzGK8Z.6LMkXntRbtu6kYbEQCI.OGXNiOho..A4HmQ3CMmtsu", // password123
    department: "Incident Response",
    courses: ["incident-response"],
    employeeId: "LEC003",
    role: "instructor",
    isVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date("2024-01-20")
  },
  {
    id: 4,
    name: "Mr. David Kim",
    email: "david.kim@cadt.edu.kh",
    password: "$2b$10$5dsBBzGK8Z.6LMkXntRbtu6kYbEQCI.OGXNiOho..A4HmQ3CMmtsu", // password123
    department: "Introduction to Linux",
    courses: ["intro-to-linux-course"],
    employeeId: "LEC004",
    role: "instructor",
    isVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date("2024-03-10")
  },
  {
    id: 5,
    name: "Dr. Emma Wilson",
    email: "emma.wilson@cadt.edu.kh",
    password: "$2b$10$5dsBBzGK8Z.6LMkXntRbtu6kYbEQCI.OGXNiOho..A4HmQ3CMmtsu", // password123
    department: "Introduction to Cybersecurity",
    courses: ["intro-to-cyber-course"],
    employeeId: "LEC005",
    role: "instructor",
    isVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date("2024-02-15")
  },

  // ── PROGRAM COORDINATORS ─────────────────────────────────────────
  {
    id: 6,
    name: "Dr. Phirum Meas",
    email: "coordinator1@cadt.edu.kh",
    password: "$2b$10$5dsBBzGK8Z.6LMkXntRbtu6kYbEQCI.OGXNiOho..A4HmQ3CMmtsu", // password123
    department: "Program Coordination",
    courses: [],
    employeeId: "COORD001",
    role: "coordinator",
    isVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 7,
    name: "Ms. Sokha Lim",
    email: "coordinator2@cadt.edu.kh",
    password: "$2b$10$5dsBBzGK8Z.6LMkXntRbtu6kYbEQCI.OGXNiOho..A4HmQ3CMmtsu", // password123
    department: "Program Coordination",
    courses: [],
    employeeId: "COORD002",
    role: "coordinator",
    isVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date("2024-01-01")
  }
];

class LecturerModel {
  // Find lecturer by email
  async findLecturerByEmail(email) {
    const result = lecturers.filter(lecturer => lecturer.email === email);
    console.log('findLecturerByEmail called with:', email);
    console.log('Found lecturers:', result);
    return result;
  }

  // Find lecturer by ID
  async findLecturerById(id) {
    return lecturers.find(lecturer => lecturer.id === parseInt(id));
  }

  // Find lecturer by verification token
  async findLecturerByVerificationToken(token) {
    return lecturers.find(lecturer => lecturer.verificationToken === token);
  }

  // Find lecturer by reset token
  async findLecturerByResetToken(token) {
    return lecturers.find(lecturer =>
      lecturer.resetToken === token &&
      lecturer.resetTokenExpiry > new Date()
    );
  }

  // Create new lecturer (for future use)
  async createLecturer(name, email, hashedPassword, department, employeeId) {
    const newLecturer = {
      id: lecturers.length + 1,
      name,
      email,
      password: hashedPassword,
      department,
      employeeId,
      isVerified: false,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date()
    };
    lecturers.push(newLecturer);
    return newLecturer;
  }

  // Update lecturer verification status
  async updateLecturerVerification(id, isVerified, verificationToken = null) {
    const lecturer = lecturers.find(l => l.id === parseInt(id));
    if (lecturer) {
      lecturer.isVerified = isVerified;
      lecturer.verificationToken = verificationToken;
      return lecturer;
    }
    return null;
  }

  // Update lecturer password
  async updateLecturerPassword(id, hashedPassword) {
    const lecturer = lecturers.find(l => l.id === parseInt(id));
    if (lecturer) {
      lecturer.password = hashedPassword;
      lecturer.resetToken = null;
      lecturer.resetTokenExpiry = null;
      return lecturer;
    }
    return null;
  }

  // Set reset token for lecturer
  async setLecturerResetToken(id, resetToken, expiryTime) {
    const lecturer = lecturers.find(l => l.id === parseInt(id));
    if (lecturer) {
      lecturer.resetToken = resetToken;
      lecturer.resetTokenExpiry = expiryTime;
      return lecturer;
    }
    return null;
  }

  // Get all lecturers (for admin purposes) — now includes role
  async getAllLecturers() {
    return lecturers.map(lecturer => ({
      id: lecturer.id,
      name: lecturer.name,
      email: lecturer.email,
      department: lecturer.department,
      employeeId: lecturer.employeeId,
      role: lecturer.role || 'instructor',
      isVerified: lecturer.isVerified,
      createdAt: lecturer.createdAt
    }));
  }

  // Get only instructors (role = "instructor")
  async getAllInstructors() {
    return lecturers
      .filter(l => l.role === 'instructor')
      .map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        department: l.department,
        employeeId: l.employeeId,
        courses: l.courses || [],
      }));
  }

  // Get only coordinators (role = "coordinator")
  async getAllCoordinators() {
    return lecturers
      .filter(l => l.role === 'coordinator')
      .map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        department: l.department,
        employeeId: l.employeeId,
      }));
  }

  // Get lecturer by employee ID
  async findLecturerByEmployeeId(employeeId) {
    return lecturers.find(lecturer => lecturer.employeeId === employeeId);
  }

  // Assign a course slug to an instructor (in-memory only)
  async assignCourseToInstructor(instructorId, courseSlug) {
    const lecturer = lecturers.find(l => l.id === parseInt(instructorId));
    if (!lecturer) return null;
    if (!lecturer.courses.includes(courseSlug)) {
      lecturer.courses.push(courseSlug);
    }
    return lecturer;
  }
}

module.exports = new LecturerModel();