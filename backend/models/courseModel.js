const db = require("../config/db");
const fs = require("fs/promises");
const path = require("path");

class CourseModel {
  constructor(database) {
    this.db = database;
    this.hasCoverImageColumnCache = null;
  }

  async hasCoverImageColumn() {
    if (this.hasCoverImageColumnCache !== null) {
      return this.hasCoverImageColumnCache;
    }

    const [rows] = await this.db.execute(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND column_name = ?
       LIMIT 1`,
      ["courses", "cover_image_url"],
    );
    this.hasCoverImageColumnCache = rows.length > 0;
    return this.hasCoverImageColumnCache;
  }

  async getCourseSelectFields() {
    const hasCoverImage = await this.hasCoverImageColumn();
    return [
      "c.id",
      "c.domain_id",
      "c.title",
      "c.description",
      hasCoverImage ? "c.cover_image_url" : "NULL AS cover_image_url",
      "c.level",
      "c.duration_hrs",
      "c.course_type",
      "c.is_published",
      "c.created_by",
      "c.created_at",
      "c.updated_at",
      "c.slug",
    ].join(",\n         ");
  }

  async findAll() {
    const selectFields = await this.getCourseSelectFields();
    const [rows] = await this.db.execute(
      `SELECT
         ${selectFields},
         (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count
       FROM courses c
       ORDER BY c.created_at DESC`,
    );

    return rows;
  }

  async findById(id) {
    const selectFields = await this.getCourseSelectFields();
    const [rows] = await this.db.execute(
      `SELECT
         ${selectFields},
         (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count
       FROM courses c
       WHERE c.id = ?
       LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  }

  async findBySlug(slug) {
    const selectFields = await this.getCourseSelectFields();
    const [rows] = await this.db.execute(
      `SELECT
         ${selectFields},
         (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count
       FROM courses c
       WHERE c.slug = ?
       LIMIT 1`,
      [slug],
    );

    return rows[0] || null;
  }

  async createCourse(payload) {
    const {
      domain_id,
      title,
      description = null,
      cover_image_url = null,
      level = "beginner",
      duration_hrs = 0,
      is_published = 0,
      course_type = "online-led",
      created_by,
    } = payload;

    const hasCoverImage = await this.hasCoverImageColumn();
    const columns = ["domain_id", "title", "description"];
    const values = [domain_id, title, description];

    if (hasCoverImage) {
      columns.push("cover_image_url");
      values.push(cover_image_url);
    }

    columns.push(
      "level",
      "duration_hrs",
      "course_type",
      "is_published",
      "created_by",
    );
    values.push(level, duration_hrs, course_type, is_published, created_by);

    const placeholders = columns.map(() => "?").join(", ");

    const [result] = await this.db.execute(
      `INSERT INTO courses (${columns.join(", ")}) VALUES (${placeholders})`,
      values,
    );

    return result.insertId;
  }

  async updateCourse(id, fields) {
    const hasCoverImage = await this.hasCoverImageColumn();

    const allowed = [
      "domain_id",
      "title",
      "description",
      "level",
      "duration_hrs",
      "course_type",
      "is_published",
    ];

    if (hasCoverImage) {
      allowed.push("cover_image_url");
    }

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

    const hasCoverImage = await this.hasCoverImageColumn();
    const seedColumns = ["domain_id", "title", "description"];
    const seedValues = [
      domainId,
      "Introduction to Cybersecurity",
      "Starter course on threats, CIA triad, and cyber hygiene.",
    ];

    if (hasCoverImage) {
      seedColumns.push("cover_image_url");
      seedValues.push("/upload/lesson/intro-to-cyber-course/cover.svg");
    }

    seedColumns.push("level", "duration_hrs", "is_published", "created_by");
    seedValues.push("beginner", 5, 1, creatorId);

    const seedPlaceholders = seedColumns.map(() => "?").join(", ");
    const [courseInsert] = await this.db.execute(
      `INSERT INTO courses (${seedColumns.join(", ")}) VALUES (${seedPlaceholders})`,
      seedValues,
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
