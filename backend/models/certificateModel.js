const db = require("../config/db");

class CertificateModel {
  constructor(database) {
    this.db = database;
  }

  // Check if user has completed course (attempted all lessons)
  async hasCourseCompletion(userId, courseId) {
    try {
      // Get total lessons in course
      const [totalLessonsResult] = await this.db.execute(
        `SELECT COUNT(*) as total FROM lessons l
         INNER JOIN modules m ON m.id = l.module_id
         WHERE m.course_id = ?`,
        [courseId],
      );

      const totalLessons = totalLessonsResult[0]?.total || 0;

      if (totalLessons === 0) return false;

      // Count distinct lesson IDs user has attempted
      const [attemptedResult] = await this.db.execute(
        `SELECT COUNT(DISTINCT qa.lesson_id) as attempted FROM quiz_attempts qa
         INNER JOIN lessons l ON l.id = qa.lesson_id
         INNER JOIN modules m ON m.id = l.module_id
         WHERE qa.user_id = ? AND m.course_id = ?`,
        [userId, courseId],
      );

      const attemptedLessons = attemptedResult[0]?.attempted || 0;

      // Course is complete if user has attempted all lessons
      return attemptedLessons >= totalLessons;
    } catch (error) {
      console.error("Error checking course completion:", error);
      return false;
    }
  }

  // Create a new certificate
  async createCertificate(userId, courseId, certificateCode, certificateHash) {
    const [result] = await this.db.execute(
      `INSERT INTO certificates (user_id, course_id, certificate_code, certificate_hash) 
       VALUES (?, ?, ?, ?)`,
      [userId, courseId, certificateCode, certificateHash],
    );
    return result.insertId;
  }

  // Get certificate by ID
  async getCertificateById(id) {
    const [rows] = await this.db.execute(
      `SELECT c.*, u.full_name, cr.title, cr.level, cr.duration_hrs
       FROM certificates c
       INNER JOIN users u ON u.id = c.user_id
       INNER JOIN courses cr ON cr.id = c.course_id
       WHERE c.id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  // Get certificate by user and course
  async getCertificateByUserAndCourse(userId, courseId) {
    const [rows] = await this.db.execute(
      `SELECT c.*, u.full_name, cr.title, cr.level, cr.duration_hrs
       FROM certificates c
       INNER JOIN users u ON u.id = c.user_id
       INNER JOIN courses cr ON cr.id = c.course_id
       WHERE c.user_id = ? AND c.course_id = ?`,
      [userId, courseId],
    );
    return rows[0] || null;
  }

  // Get all certificates for a user
  async getCertificatesByUserId(userId) {
    const [rows] = await this.db.execute(
      `SELECT c.*, cr.title, cr.level
       FROM certificates c
       INNER JOIN courses cr ON cr.id = c.course_id
       WHERE c.user_id = ?
       ORDER BY c.issued_at DESC`,
      [userId],
    );
    return rows;
  }

  // Get certificate by hash
  async getCertificateByHash(certificateHash) {
    const [rows] = await this.db.execute(
      `SELECT c.*, u.full_name, cr.title, cr.level, cr.duration_hrs
       FROM certificates c
       INNER JOIN users u ON u.id = c.user_id
       INNER JOIN courses cr ON cr.id = c.course_id
       WHERE c.certificate_hash = ?`,
      [certificateHash],
    );
    return rows[0] || null;
  }

  // Update certificate PDF path
  async updateCertificatePdfPath(certificateId, pdfPath) {
    const [result] = await this.db.execute(
      `UPDATE certificates SET pdf_path = ? WHERE id = ?`,
      [pdfPath, certificateId],
    );
    return result;
  }

  // Update certificate hash (for backfilling missing hashes)
  async updateCertificateHash(certificateId, hash) {
    const [result] = await this.db.execute(
      `UPDATE certificates SET certificate_hash = ? WHERE id = ?`,
      [hash, certificateId],
    );
    return result;
  }

  // Get course completion stats for certificate
  async getCourseCompletionStats(userId, courseId) {
    const [stats] = await this.db.execute(
      `SELECT 
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT qa.lesson_id) as completed_lessons,
        AVG(qa.score) as average_score,
        MAX(qa.score) as highest_score
       FROM lessons l
       INNER JOIN modules m ON m.id = l.module_id
       LEFT JOIN quiz_attempts qa ON l.id = qa.lesson_id AND qa.user_id = ?
       WHERE m.course_id = ?`,
      [userId, courseId],
    );
    return stats[0] || {};
  }
}

module.exports = new CertificateModel(db);
