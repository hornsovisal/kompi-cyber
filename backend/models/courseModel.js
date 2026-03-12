const db = require("../config/db");
const fs = require("fs/promises");
const path = require("path");

class CourseModel {
  constructor(database) {
    this.db = database;
  }

  async findAll() {
    const [rows] = await this.db.execute(
      `SELECT
				 c.id,
				 c.domain_id,
				 c.title,
				 c.description,
				 c.level,
				 c.duration_hrs,
				 c.is_published,
				 c.created_by,
				 c.created_at,
				 c.updated_at
			 FROM courses c
			 ORDER BY c.created_at DESC`,
    );

    return rows;
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      `SELECT
				 c.id,
				 c.domain_id,
				 c.title,
				 c.description,
				 c.level,
				 c.duration_hrs,
				 c.is_published,
				 c.created_by,
				 c.created_at,
				 c.updated_at
			 FROM courses c
			 WHERE c.id = ?
			 LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  }

  async createCourse(payload) {
    const {
      domain_id,
      title,
      description = null,
      level = "beginner",
      duration_hrs = 0,
      is_published = 0,
      created_by,
    } = payload;

    const [result] = await this.db.execute(
      `INSERT INTO courses (
				domain_id,
				title,
				description,
				level,
				duration_hrs,
				is_published,
				created_by
			) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        domain_id,
        title,
        description,
        level,
        duration_hrs,
        is_published,
        created_by,
      ],
    );

    return result.insertId;
  }

  async updateCourse(id, fields) {
    const allowed = [
      "domain_id",
      "title",
      "description",
      "level",
      "duration_hrs",
      "is_published",
    ];

    const keys = Object.keys(fields).filter(
      (k) => allowed.includes(k) && fields[k] !== undefined,
    );

    if (keys.length === 0) return null;

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = [...keys.map((k) => fields[k]), id];

    const [result] = await this.db.execute(
      `UPDATE courses SET ${setClause} WHERE id = ?`,
      values,
    );

    return result;
  }

  async deleteCourse(id) {
    const [result] = await this.db.execute("DELETE FROM courses WHERE id = ?", [
      id,
    ]);
    return result;
  }

  async getLessonsByCourse(courseId) {
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

  async ensureSeedFromUploadIfEmpty() {
    const [courseCountRows] = await this.db.execute(
      "SELECT COUNT(*) AS total FROM courses",
    );

    if ((courseCountRows[0]?.total || 0) > 0) {
      return { seeded: false, reason: "courses_already_exist" };
    }

    const uploadDir = path.resolve(
      __dirname,
      "../../upload/lesson/intro-to-cyber-course",
    );

    const [users] = await this.db.execute(
      "SELECT id FROM users ORDER BY created_at ASC LIMIT 1",
    );
    if (!users[0]?.id) {
      return { seeded: false, reason: "no_user_available_for_course_creator" };
    }

    const creatorId = users[0].id;

    let files;
    try {
      files = await fs.readdir(uploadDir);
    } catch (error) {
      return { seeded: false, reason: "upload_folder_not_found" };
    }

    const markdownFiles = files
      .filter((f) => /^module-\d+-.+\.md$/i.test(f))
      .sort((a, b) => {
        const am = Number(a.match(/^module-(\d+)-/i)?.[1] || 0);
        const bm = Number(b.match(/^module-(\d+)-/i)?.[1] || 0);
        return am - bm;
      });

    if (markdownFiles.length === 0) {
      return { seeded: false, reason: "no_markdown_lessons_found" };
    }

    // Ensure a domain exists
    let domainId;
    const [existingDomain] = await this.db.execute(
      "SELECT id FROM domains WHERE name = ? LIMIT 1",
      ["Cybersecurity Fundamentals"],
    );
    if (existingDomain[0]?.id) {
      domainId = existingDomain[0].id;
    } else {
      const [insertDomain] = await this.db.execute(
        "INSERT INTO domains (name, description) VALUES (?, ?)",
        [
          "Cybersecurity Fundamentals",
          "Foundational cybersecurity concepts imported from lesson markdown files.",
        ],
      );
      domainId = insertDomain.insertId;
    }

    const [courseInsert] = await this.db.execute(
      `INSERT INTO courses (
        domain_id,
        title,
        description,
        level,
        duration_hrs,
        is_published,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        domainId,
        "Introduction to Cybersecurity",
        "Auto-seeded course content from /upload/lesson/intro-to-cyber-course",
        "beginner",
        5,
        1,
        creatorId,
      ],
    );

    const courseId = courseInsert.insertId;

    for (let i = 0; i < markdownFiles.length; i += 1) {
      const fileName = markdownFiles[i];
      const moduleOrder = i + 1;
      const filePath = path.join(uploadDir, fileName);
      const content = await fs.readFile(filePath, "utf-8");

      const firstHeading = content
        .split("\n")
        .find((line) => line.trim().startsWith("# "))
        ?.replace(/^#\s+/, "")
        .trim();

      const fallbackTitle = fileName
        .replace(/\.md$/i, "")
        .replace(/^module-\d+-/i, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const moduleTitle = firstHeading || fallbackTitle;

      const [moduleInsert] = await this.db.execute(
        "INSERT INTO modules (course_id, title, module_order) VALUES (?, ?, ?)",
        [courseId, moduleTitle, moduleOrder],
      );

      const moduleId = moduleInsert.insertId;

      await this.db.execute(
        "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
        [moduleId, moduleTitle, content, 1],
      );
    }

    return { seeded: true, courseId };
  }
}

module.exports = new CourseModel(db);
