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

  async getModulesByCourse(courseId) {
    const [rows] = await this.db.execute(
      `SELECT
         id AS module_id,
         course_id,
         title AS module_title,
         module_order
       FROM modules
       WHERE course_id = ?
       ORDER BY module_order ASC, id ASC`,
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

  // Clone a course with all its modules, lessons, quizzes, and exercises
  async cloneCourse(sourceCourseId, newCreatorId, titleSuffix = "(Cloned)") {
    try {
      // Get source course
      const source = await this.findById(sourceCourseId);
      if (!source) {
        throw new Error("Source course not found");
      }

      // Create new course
      const newTitle = `${source.title} ${titleSuffix}`;
      const newCourseId = await this.createCourse({
        domain_id: source.domain_id,
        title: newTitle,
        description: source.description,
        cover_image_url: source.cover_image_url,
        level: source.level,
        duration_hrs: source.duration_hrs,
        is_published: 0, // New cloned courses start unpublished
        course_type: source.course_type,
        created_by: newCreatorId,
      });

      // Get all modules from source course
      const [sourceModules] = await this.db.execute(
        `SELECT id, title, module_order FROM modules WHERE course_id = ? ORDER BY module_order`,
        [sourceCourseId],
      );

      // Map old module IDs to new module IDs
      const moduleIdMap = {};

      for (const sourceModule of sourceModules) {
        // Create new module
        const [newModule] = await this.db.execute(
          `INSERT INTO modules (course_id, title, module_order) VALUES (?, ?, ?)`,
          [newCourseId, sourceModule.title, sourceModule.module_order],
        );
        moduleIdMap[sourceModule.id] = newModule.insertId;

        // Get all lessons from source module
        const [sourceLessons] = await this.db.execute(
          `SELECT id, title, content_md, lesson_order FROM lessons WHERE module_id = ? ORDER BY lesson_order`,
          [sourceModule.id],
        );

        // Clone each lesson
        for (const sourceLesson of sourceLessons) {
          await this.db.execute(
            `INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)`,
            [
              newModule.insertId,
              sourceLesson.title,
              sourceLesson.content_md,
              sourceLesson.lesson_order,
            ],
          );
        }
      }

      // Clone quizzes (if they exist)
      const [sourceQuizzes] = await this.db.execute(
        `SELECT * FROM quizzes WHERE course_id = ? OR id IN (
          SELECT quiz_id FROM lesson_quizzes WHERE lesson_id IN (
            SELECT id FROM lessons WHERE module_id IN (
              SELECT id FROM modules WHERE course_id = ?
            )
          )
        )`,
        [sourceCourseId, sourceCourseId],
      );

      const quizIdMap = {};
      for (const sourceQuiz of sourceQuizzes) {
        const [newQuiz] = await this.db.execute(
          `INSERT INTO quizzes (course_id, title, description) VALUES (?, ?, ?)`,
          [newCourseId, sourceQuiz.title, sourceQuiz.description],
        );
        quizIdMap[sourceQuiz.id] = newQuiz.insertId;
      }

      return newCourseId;
    } catch (error) {
      throw new Error(`Failed to clone course: ${error.message}`);
    }
  }
}

module.exports = new CourseModel(db);
