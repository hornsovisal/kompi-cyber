/**
 * studentModel.js
 * Mock student data for the RBAC invitation system.
 * "Mock data is fine" — per spec.
 * In production, replace with a real DB model.
 */

let students = [
  { id: 'STU001', name: 'Alice Nguyen',   email: 'alice.nguyen@student.cadt.edu.kh',   enrolledCourses: ['course-001', 'course-002'] },
  { id: 'STU002', name: 'Sok Chenda',     email: 'sok.chenda@student.cadt.edu.kh',     enrolledCourses: ['course-003'] },
  { id: 'STU003', name: 'Maya Soth',      email: 'maya.soth@student.cadt.edu.kh',      enrolledCourses: ['course-004'] },
  { id: 'STU004', name: 'Vincent Lim',    email: 'vincent.lim@student.cadt.edu.kh',    enrolledCourses: ['course-005'] },
  { id: 'STU005', name: 'Sreynich Keo',   email: 'sreynich.keo@student.cadt.edu.kh',   enrolledCourses: ['course-001'] },
  { id: 'STU006', name: 'Bunthoeun Chan', email: 'bunthoeun.chan@student.cadt.edu.kh', enrolledCourses: [] },
  { id: 'STU007', name: 'Dara Pich',      email: 'dara.pich@student.cadt.edu.kh',      enrolledCourses: ['course-002', 'course-003'] },
];

class StudentModel {
  findAll() {
    return students.map(s => this._safe(s));
  }

  findById(id) {
    return students.find(s => s.id === id) || null;
  }

  findByEmail(email) {
    return students.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findByCourse(courseId) {
    return students
      .filter(s => s.enrolledCourses.includes(courseId))
      .map(s => this._safe(s));
  }

  /**
   * Invite (add) a student by email.
   * Creates a new student record if one doesn't exist yet.
   */
  inviteStudent(email, name, courseId) {
    let student = this.findByEmail(email);

    if (!student) {
      student = {
        id: `STU${String(students.length + 1).padStart(3, '0')}`,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        enrolledCourses: [],
      };
      students.push(student);
    }

    if (!student.enrolledCourses.includes(courseId)) {
      student.enrolledCourses.push(courseId);
    }

    return this._safe(student);
  }

  /**
   * Enroll an existing student in a course.
   */
  enrollInCourse(studentId, courseId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    if (!student.enrolledCourses.includes(courseId)) {
      student.enrolledCourses.push(courseId);
    }
    return this._safe(student);
  }

  // Strip sensitive fields before returning
  _safe(s) {
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      enrolledCourses: s.enrolledCourses,
    };
  }
}

module.exports = new StudentModel();
