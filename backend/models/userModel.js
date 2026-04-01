const { randomUUID } = require("crypto");
const db = require("../config/db");

class UserModel {
  constructor(database) {
    this.db = database;
  }

  async findUserByEmail(email) {
    const [rows] = await this.db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    return rows;
  }

  async createUser(name, email, passwordHash, roleId = 1, isActive = 1) {
    const userId = randomUUID();

    const [result] = await this.db.execute(
      `INSERT INTO users (id, full_name, email, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, email, passwordHash, roleId, isActive],
    );

    return { id: userId, affectedRows: result.affectedRows };
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  }

  async findAllUsers() {
    const [rows] = await this.db.execute(
      `SELECT
         u.id,
         u.full_name,
         u.email,
         u.role_id,
         r.name AS role_name,
         u.is_active,
         u.created_at,
         u.updated_at
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`,
    );

    return rows;
  }

  async updateUser(id, fields) {
    const allowed = ["full_name", "email"];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));

    if (keys.length === 0) return null;

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = [...keys.map((k) => fields[k]), id];

    const [result] = await this.db.execute(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values,
    );

    return result;
  }

  async activateUser(id) {
    const [result] = await this.db.execute(
      "UPDATE users SET is_active = 1 WHERE id = ?",
      [id],
    );
    return result;
  }

  async updatePassword(id, hashedPassword) {
    const [result] = await this.db.execute(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hashedPassword, id],
    );
    return result;
  }

  async softDeleteUserAccount(connection, userId) {
    const [rows] = await connection.execute(
      "SELECT email FROM users WHERE id = ? LIMIT 1",
      [userId],
    );

    const email = rows[0]?.email || "deleted@example.com";
    const deletedEmail = `deleted+${Date.now()}+${userId.slice(0, 8)}@example.invalid`;
    const passwordHash = `deleted:${Date.now()}`;

    const [result] = await connection.execute(
      `UPDATE users
       SET full_name = ?, email = ?, password_hash = ?, is_active = 0
       WHERE id = ?`,
      ["Deleted User", `${email}#${deletedEmail}`, passwordHash, userId],
    );

    return result.affectedRows > 0;
  }

  async deleteUserAccount(userId) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [ownedCourses] = await connection.execute(
        "SELECT id FROM courses WHERE created_by = ? LIMIT 1",
        [userId],
      );

      if (ownedCourses.length > 0) {
        await connection.rollback();
        return { deleted: false, blocked: true };
      }

      const [attemptRows] = await connection.execute(
        "SELECT id FROM quiz_attempts WHERE user_id = ?",
        [userId],
      );
      const attemptIds = attemptRows.map((r) => r.id);

      if (attemptIds.length > 0) {
        const placeholders = attemptIds.map(() => "?").join(", ");
        await connection.execute(
          `DELETE FROM quiz_answers WHERE attempt_id IN (${placeholders})`,
          attemptIds,
        );
      }

      await connection.execute("DELETE FROM quiz_attempts WHERE user_id = ?", [
        userId,
      ]);
      await connection.execute(
        "DELETE FROM exercise_submissions WHERE user_id = ?",
        [userId],
      );
      await connection.execute("DELETE FROM lesson_progress WHERE user_id = ?", [
        userId,
      ]);
      await connection.execute("DELETE FROM enrollments WHERE user_id = ?", [
        userId,
      ]);
      await connection.execute("DELETE FROM certificates WHERE user_id = ?", [
        userId,
      ]);

      // Keep compatibility with schemas where invitation FKs may differ.
      try {
        await connection.execute(
          "UPDATE course_invitations SET student_id = NULL WHERE student_id = ?",
          [userId],
        );
        await connection.execute(
          "DELETE FROM course_invitations WHERE teacher_id = ?",
          [userId],
        );
      } catch (invitationError) {
        if (invitationError?.code !== "ER_NO_SUCH_TABLE") {
          throw invitationError;
        }
      }

      let deleteResult;
      try {
        [deleteResult] = await connection.execute("DELETE FROM users WHERE id = ?", [
          userId,
        ]);
      } catch (deleteError) {
        // Some deployed schemas can have extra user FK references.
        if (deleteError?.code === "ER_ROW_IS_REFERENCED_2") {
          const softDeleted = await this.softDeleteUserAccount(connection, userId);
          await connection.commit();
          return { deleted: softDeleted, blocked: false, softDeleted: true };
        }
        throw deleteError;
      }

      await connection.commit();

      return {
        deleted: deleteResult.affectedRows > 0,
        blocked: false,
        softDeleted: false,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserProgress(userId) {
    const [rows] = await this.db.execute(
      `SELECT
         lp.lesson_id,
         l.title        AS lesson_title,
         lp.status,
         lp.completed_at
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       WHERE lp.user_id = ?
       ORDER BY lp.completed_at DESC`,
      [userId],
    );
    return rows;
  }

  async getDashboardSummary(userId) {
    const [enrolledRows] = await this.db.execute(
      "SELECT COUNT(*) AS total FROM enrollments WHERE user_id = ?",
      [userId],
    );

    const [courseProgressRows] = await this.db.execute(
      `SELECT
         c.id AS course_id,
         c.duration_hrs,
         COUNT(l.id) AS total_lessons,
         SUM(
           CASE
             WHEN lp.status = 'completed' OR qa.lesson_id IS NOT NULL THEN 1
             ELSE 0
           END
         ) AS completed_lessons
       FROM enrollments e
       INNER JOIN courses c ON c.id = e.course_id
       INNER JOIN modules m ON m.course_id = c.id
       INNER JOIN lessons l ON l.module_id = m.id
       LEFT JOIN lesson_progress lp
         ON lp.lesson_id = l.id
        AND lp.user_id = e.user_id
       LEFT JOIN (
         SELECT DISTINCT user_id, lesson_id
         FROM quiz_attempts
       ) qa
         ON qa.user_id = e.user_id
        AND qa.lesson_id = l.id
       WHERE e.user_id = ?
       GROUP BY c.id, c.duration_hrs`,
      [userId],
    );

    let completedCourses = 0;
    let completedLessonsTotal = 0;
    let hoursLearned = 0;
    for (const row of courseProgressRows) {
      const totalLessons = Number(row.total_lessons || 0);
      const completedLessons = Number(row.completed_lessons || 0);
      const durationHours = Number(row.duration_hrs || 0);

      completedLessonsTotal += completedLessons;

      if (totalLessons > 0 && completedLessons >= totalLessons) {
        completedCourses += 1;
      }

      if (totalLessons > 0 && durationHours > 0) {
        hoursLearned += (completedLessons / totalLessons) * durationHours;
      }
    }

    const [activityRows] = await this.db.execute(
      `SELECT *
       FROM (
         SELECT
           'enrollment' AS activity_type,
           CONCAT('Enrolled in ', c.title) AS activity_text,
           e.enrolled_at AS occurred_at
         FROM enrollments e
         INNER JOIN courses c ON c.id = e.course_id
         WHERE e.user_id = ?

         UNION ALL

         SELECT
           'lesson_completed' AS activity_type,
           CONCAT('Completed lesson: ', l.title) AS activity_text,
           lp.completed_at AS occurred_at
         FROM lesson_progress lp
         INNER JOIN lessons l ON l.id = lp.lesson_id
         WHERE lp.user_id = ?
           AND lp.status = 'completed'
           AND lp.completed_at IS NOT NULL

         UNION ALL

         SELECT
           'practice' AS activity_type,
           CONCAT('Practice score ', qa.score, '% on ', l.title) AS activity_text,
           qa.submitted_at AS occurred_at
         FROM quiz_attempts qa
         INNER JOIN lessons l ON l.id = qa.lesson_id
         WHERE qa.user_id = ?
       ) activities
       ORDER BY occurred_at DESC
       LIMIT 8`,
      [userId, userId, userId],
    );

    return {
      enrolledCourses: Number(enrolledRows[0]?.total || 0),
      // Dashboard card labeled "Completed" is lesson-oriented.
      completedCourses: completedLessonsTotal,
      completedCourseCount: completedCourses,
      hoursLearned: Math.round(hoursLearned * 10) / 10,
      recentActivity: activityRows,
    };
  }

  async updateStatus(id, isActive) {
    const [result] = await this.db.execute(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [isActive ? 1 : 0, id],
    );

    return result;
  }

  async updateRole(id, roleId) {
    const [result] = await this.db.execute(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [roleId, id],
    );

    return result;
  }

  async roleExists(roleId) {
    const [rows] = await this.db.execute(
      "SELECT id FROM roles WHERE id = ? LIMIT 1",
      [roleId],
    );

    return rows.length > 0;
  }

  toSafeUser(userRow) {
    if (!userRow) return null;

    return {
      id: userRow.id,
      fullName: userRow.full_name,
      email: userRow.email,
      roleId: userRow.role_id,
      roleName: userRow.role_name,
      isActive: Boolean(userRow.is_active),
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
    };
  }
}

module.exports = new UserModel(db);
