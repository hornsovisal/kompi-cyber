const db = require("../config/db");
const fs = require("fs/promises");
const path = require("path");

const COURSE_UPLOAD_DIR = {
  1: "intro-to-cyber-course",
  2: "intro-to-linux-course",
  3: "network-security",
  4: "web-security",
  5: "incident-response",
};

class LessonModel {
  constructor(database) {
    this.db = database;
  }

  async readMarkdownByRelativePath(relPath) {
    if (!relPath) return null;

    const absPath = path.resolve(__dirname, "../../", relPath);
    try {
      return await fs.readFile(absPath, "utf-8");
    } catch (_error) {
      return null;
    }
  }

  async findFallbackMarkdownPath(row) {
    const courseId = Number(row?.course_id || 0);
    const folder = COURSE_UPLOAD_DIR[courseId];
    if (!folder) return null;

    const lessonRoot = path.resolve(__dirname, "../../upload/lesson", folder);
    let files;
    try {
      files = (await fs.readdir(lessonRoot))
        .filter((fileName) => fileName.toLowerCase().endsWith(".md"))
        .sort();
    } catch (_error) {
      return null;
    }

    if (files.length === 0) return null;

    const moduleOrder = Number(row?.module_order || 1);
    const lessonOrder = Math.max(1, Number(row?.lesson_order || 1));

    const moduleCandidates = files.filter((fileName) => {
      const lower = fileName.toLowerCase();
      return (
        lower.includes(`module-${moduleOrder}-`) ||
        lower.includes(`module${moduleOrder}-`)
      );
    });

    if (moduleCandidates.length >= lessonOrder) {
      return `upload/lesson/${folder}/${moduleCandidates[lessonOrder - 1]}`;
    }

    if (moduleCandidates.length > 0) {
      return `upload/lesson/${folder}/${moduleCandidates[0]}`;
    }

    return `upload/lesson/${folder}/${files[0]}`;
  }

  normalizeMarkdownPath(content) {
    if (typeof content !== "string") return null;
    const raw = content.trim();
    if (!raw.toLowerCase().endsWith(".md")) return null;

    // Accept paths like "upload/lesson/..." or noisy absolute strings containing "/upload/...".
    const marker = "upload/";
    const idx = raw.toLowerCase().indexOf(marker);
    if (idx < 0) return null;

    return raw.slice(idx).replace(/^\/+/, "");
  }

  async resolveLessonContent(row) {
    const relPath = this.normalizeMarkdownPath(row?.content_md);
    if (relPath) {
      const markdown = await this.readMarkdownByRelativePath(relPath);
      if (typeof markdown === "string" && markdown.trim().length > 0) {
        return { ...row, content_md: markdown };
      }
    }

    const fallbackPath = await this.findFallbackMarkdownPath(row);
    if (fallbackPath) {
      const fallbackMarkdown = await this.readMarkdownByRelativePath(fallbackPath);
      if (
        typeof fallbackMarkdown === "string" &&
        fallbackMarkdown.trim().length > 0
      ) {
        return { ...row, content_md: fallbackMarkdown };
      }
    }

    // Keep original content when no file can be resolved.
    return row;
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

    if (!rows[0]) return null;
    return this.resolveLessonContent(rows[0]);
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

    return Promise.all(rows.map((row) => this.resolveLessonContent(row)));
  }
}

module.exports = new LessonModel(db);
