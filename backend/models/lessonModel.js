const db = require("../config/db");

class LessonModel {
  constructor(database) {
    this.db = database;
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      `SELECT
				 l.id,
				 l.module_id,
         m.title AS module_title,
         m.module_order,
				 m.course_id,
				 l.title,
				 l.content_md,
				 l.lesson_order,
				 l.created_at,
				 l.updated_at
			 FROM lessons l
			 INNER JOIN modules m ON m.id = l.module_id
			 WHERE l.id = ?
			 LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  }

  async createLesson(payload) {
    const { module_id, title, content_md = null, lesson_order } = payload;

    const [result] = await this.db.execute(
      `INSERT INTO lessons (module_id, title, content_md, lesson_order)
			 VALUES (?, ?, ?, ?)`,
      [module_id, title, content_md, lesson_order],
    );

    return result.insertId;
  }

  async updateLesson(id, fields) {
    const allowed = ["module_id", "title", "content_md", "lesson_order"];
    const keys = Object.keys(fields).filter(
      (k) => allowed.includes(k) && fields[k] !== undefined,
    );

    if (keys.length === 0) return null;

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = [...keys.map((k) => fields[k]), id];

    const [result] = await this.db.execute(
      `UPDATE lessons SET ${setClause} WHERE id = ?`,
      values,
    );

    return result;
  }

  async deleteLesson(id) {
    const [result] = await this.db.execute("DELETE FROM lessons WHERE id = ?", [
      id,
    ]);
    return result;
  }

  async getByCourseId(courseId) {
    const [rows] = await this.db.execute(
      `SELECT
				 l.id,
				 l.module_id,
         m.title AS module_title,
         m.module_order,
				 m.course_id,
				 l.title,
				 l.content_md,
				 l.lesson_order,
				 l.created_at,
				 l.updated_at
			 FROM lessons l
			 INNER JOIN modules m ON m.id = l.module_id
			 WHERE m.course_id = ?
			 ORDER BY m.module_order ASC, l.lesson_order ASC`,
      [courseId],
    );

    return rows;
  }
}

module.exports = new LessonModel(db);
