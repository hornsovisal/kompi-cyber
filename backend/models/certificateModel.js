const db = require("../config/db");

class CertificateModel {
  constructor(database) {
    this.db = database;
  }

  // Check if user has completed course
  // A lesson counts as completed when either:
  // 1) lesson_progress status is completed, or
  // 2) user has at least one quiz attempt for that lesson.
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

      const [completedResult] = await this.db.execute(
        `SELECT COUNT(DISTINCT l.id) as completed
         FROM lessons l
         INNER JOIN modules m ON m.id = l.module_id
         LEFT JOIN lesson_progress lp
           ON lp.lesson_id = l.id
          AND lp.user_id = ?
          AND lp.status = 'completed'
         LEFT JOIN quiz_attempts qa
           ON qa.lesson_id = l.id
          AND qa.user_id = ?
         WHERE m.course_id = ?
           AND (lp.lesson_id IS NOT NULL OR qa.lesson_id IS NOT NULL)`,
        [userId, userId, courseId],
      );

      const completedLessons = Number(completedResult[0]?.completed || 0);

      return completedLessons >= totalLessons;
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
       WHERE c.certificate_hash LIKE ?`,
      [`${certificateHash}%`],
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
        COUNT(
          DISTINCT CASE
            WHEN lp.lesson_id IS NOT NULL OR qa.lesson_id IS NOT NULL THEN l.id
            ELSE NULL
          END
        ) as completed_lessons,
        AVG(qa.score) as average_score,
        MAX(qa.score) as highest_score
       FROM lessons l
       INNER JOIN modules m ON m.id = l.module_id
       LEFT JOIN lesson_progress lp
         ON lp.lesson_id = l.id
        AND lp.user_id = ?
        AND lp.status = 'completed'
       LEFT JOIN quiz_attempts qa ON l.id = qa.lesson_id AND qa.user_id = ?
       WHERE m.course_id = ?`,
      [userId, userId, courseId],
    );
    return stats[0] || {};
  }
}

module.exports = new CertificateModel(db);
