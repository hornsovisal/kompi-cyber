const db = require("../config/db");

class ExerciseModel {
  constructor(database) {
    this.db = database;
  }

  async getByLessonId(lessonId) {
    const [rows] = await this.db.execute(
      `SELECT
         id,
         lesson_id,
         title,
         instructions_md,
         starter_code,
         language,
         time_limit_ms,
         memory_limit_mb,
         created_at
       FROM exercises
       WHERE lesson_id = ?
       ORDER BY id ASC`,
      [lessonId],
    );

    return rows;
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      `SELECT
         id,
         lesson_id,
         title,
         instructions_md,
         starter_code,
         language,
         time_limit_ms,
         memory_limit_mb,
         created_at
       FROM exercises
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  }

  async createExercise(exercise) {
    const {
      lesson_id,
      title,
      instructions_md = null,
      starter_code = null,
      language = "python",
      time_limit_ms = 10000,
      memory_limit_mb = 128,
    } = exercise;

    const [result] = await this.db.execute(
      `INSERT INTO exercises (
        lesson_id,
        title,
        instructions_md,
        starter_code,
        language,
        time_limit_ms,
        memory_limit_mb
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lesson_id,
        title,
        instructions_md,
        starter_code,
        language,
        time_limit_ms,
        memory_limit_mb,
      ],
    );

    return result.insertId;
  }

  async updateExercise(id, fields) {
    const allowed = [
      "lesson_id",
      "title",
      "instructions_md",
      "starter_code",
      "language",
      "time_limit_ms",
      "memory_limit_mb",
    ];

    const keys = Object.keys(fields).filter(
      (k) => allowed.includes(k) && fields[k] !== undefined,
    );

    if (keys.length === 0) return null;

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = [...keys.map((k) => fields[k]), id];

    const [result] = await this.db.execute(
      `UPDATE exercises SET ${setClause} WHERE id = ?`,
      values,
    );

    return result;
  }

  async deleteExercise(id) {
    const [result] = await this.db.execute(
      "DELETE FROM exercises WHERE id = ?",
      [id],
    );

    return result;
  }
}

module.exports = new ExerciseModel(db);
