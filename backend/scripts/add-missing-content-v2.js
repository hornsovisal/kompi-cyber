const path = require("path");
const fs = require("fs");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

const mysql = require("mysql2/promise");

async function addMissingContent() {
  // Create a simple connection without the pool complexities
  let connection;

  try {
    console.log("🔌 Connecting to Aiven MySQL...\n");

    // Load SSL certificate
    let sslConfig = { rejectUnauthorized: false };
    const certPath = path.join(__dirname, "../config/aiven-ca.pem");

    try {
      const ca = fs.readFileSync(certPath, "utf8");
      sslConfig = {
        ca: ca,
        rejectUnauthorized: true,
      };
      console.log("✅ Using SSL certificate\n");
    } catch (err) {
      console.warn("⚠️  Could not load certificate, using unverified SSL\n");
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 1,
    });

    console.log("✅ Connected successfully!\n");

    // Check all courses
    const [courses] = await connection.execute(
      "SELECT id, title FROM courses WHERE is_published = 1 ORDER BY id",
    );

    console.log(`Found ${courses.length} published courses\n`);

    for (const course of courses) {
      const [modules] = await connection.execute(
        "SELECT COUNT(*) as count FROM modules WHERE course_id = ?",
        [course.id],
      );

      const moduleCount = modules[0].count;

      if (moduleCount === 0) {
        console.log(
          `❌ Course "${course.title}" (ID: ${course.id}) has no modules`,
        );

        // Add module
        const moduleTitle = `Module 1: Introduction to ${course.title}`;
        const [moduleResult] = await connection.execute(
          "INSERT INTO modules (course_id, title, module_order) VALUES (?, ?, ?)",
          [course.id, moduleTitle, 1],
        );

        const moduleId = moduleResult.insertId;
        console.log(`   ✅ Added Module (ID: ${moduleId})`);

        // Add lesson
        const lessonTitle = `Getting Started with ${course.title}`;
        const lessonContent = `# ${lessonTitle}\n\nWelcome to ${course.title}! Complete the quiz below.`;

        const [lessonResult] = await connection.execute(
          "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
          [moduleId, lessonTitle, lessonContent, 1],
        );

        const lessonId = lessonResult.insertId;
        console.log(`   ✅ Added Lesson (ID: ${lessonId})`);

        // Add quiz question
        const [questionResult] = await connection.execute(
          "INSERT INTO quiz_questions (lesson_id, question_text, question_order) VALUES (?, ?, ?)",
          [lessonId, `What is ${course.title} fundamentally about?`, 1],
        );

        const questionId = questionResult.insertId;
        console.log(`   ✅ Added Quiz Question (ID: ${questionId})`);

        // Add quiz options
        const options = [
          {
            text: `The fundamental principles and practices of ${course.title}`,
            correct: 1,
          },
          { text: `Advanced topics beyond initial scope`, correct: 0 },
          { text: `Deprecated technology`, correct: 0 },
          { text: `Unrelated concepts`, correct: 0 },
        ];

        for (const option of options) {
          await connection.execute(
            "INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
            [questionId, option.text, option.correct],
          );
        }

        console.log(`   ✅ Added 4 quiz options\n`);
      } else {
        console.log(
          `✅ Course "${course.title}" (ID: ${course.id}) - Has ${moduleCount} module(s)\n`,
        );
      }
    }

    console.log("✅ Content update complete!");
    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

addMissingContent();
