const db = require("../config/db");

class InvitationModel {
  // Send invitation to a student
  static async sendInvitation(courseId, teacherId, studentEmail) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO course_invitations (course_id, teacher_id, student_email)
        VALUES (?, ?, ?)
      `;
      db.query(query, [courseId, teacherId, studentEmail], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Get pending invitations for a student
  static async getStudentInvitations(studentEmail) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ci.id,
          ci.course_id,
          ci.teacher_id,
          ci.student_email,
          ci.status,
          ci.invited_at,
          c.title AS course_title,
          c.description AS course_description,
          u.full_name AS teacher_name
        FROM course_invitations ci
        JOIN courses c ON ci.course_id = c.id
        JOIN users u ON ci.teacher_id = u.id
        WHERE ci.student_email = ?
        ORDER BY ci.invited_at DESC
      `;
      db.query(query, [studentEmail], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Get pending invitations for a specific student email on a course
  static async getPendingByEmailAndCourse(studentEmail, courseId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM course_invitations
        WHERE student_email = ? AND course_id = ? AND status = 'pending'
        LIMIT 1
      `;
      db.query(query, [studentEmail, courseId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || null);
      });
    });
  }

  // Accept invitation (and auto-enroll)
  static async acceptInvitation(invitationId, studentId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE course_invitations
        SET status = 'accepted', responded_at = NOW(), student_id = ?
        WHERE id = ?
      `;
      db.query(query, [studentId, invitationId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Reject invitation
  static async rejectInvitation(invitationId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE course_invitations
        SET status = 'rejected', responded_at = NOW()
        WHERE id = ?
      `;
      db.query(query, [invitationId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Get all invitations for a course (for teacher)
  static async getCourseInvitations(courseId, teacherId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ci.id,
          ci.course_id,
          ci.teacher_id,
          ci.student_email,
          ci.status,
          ci.invited_at,
          ci.responded_at,
          COALESCE(u.full_name, 'Not registered yet') AS student_name
        FROM course_invitations ci
        LEFT JOIN users u ON ci.student_id = u.id
        WHERE ci.course_id = ? AND ci.teacher_id = ?
        ORDER BY ci.invited_at DESC
      `;
      db.query(query, [courseId, teacherId], (err, results) => {
        if (err) reject(err);
        else resolve(results || []);
      });
    });
  }

  // Check if invitation exists
  static async getInvitationById(invitationId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM course_invitations WHERE id = ?`;
      db.query(query, [invitationId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || null);
      });
    });
  }

  // Cancel/revoke invitation (teacher)
  static async cancelInvitation(invitationId, teacherId) {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM course_invitations
        WHERE id = ? AND teacher_id = ? AND status = 'pending'
      `;
      db.query(query, [invitationId, teacherId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // Resend invitation (update timestamp)
  static async resendInvitation(invitationId, teacherId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE course_invitations
        SET invited_at = NOW()
        WHERE id = ? AND teacher_id = ? AND status = 'pending'
      `;
      db.query(query, [invitationId, teacherId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = InvitationModel;
