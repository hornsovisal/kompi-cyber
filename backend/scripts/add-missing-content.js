const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

const pool = require("../config/db");

async function addMissingContent() {
  const connection = await pool.getConnection();

  try {
    console.log("🔍 Checking courses for missing content...\n");

    // Get all courses
    const [courses] = await connection.query(
      "SELECT id, title FROM courses WHERE is_published = 1 ORDER BY id",
    );

    console.log(`Found ${courses.length} published courses\n`);

    for (const course of courses) {
      const courseId = course.id;
      const courseTitle = course.title;

      // Check if course has modules
      const [modules] = await connection.query(
        "SELECT COUNT(*) as count FROM modules WHERE course_id = ?",
        [courseId],
      );

      const moduleCount = modules[0].count;

      if (moduleCount === 0) {
        console.log(
          `❌ Course "${courseTitle}" (ID: ${courseId}) - No modules`,
        );

        // Add a module
        const [moduleResult] = await connection.query(
          "INSERT INTO modules (course_id, title, module_order) VALUES (?, ?, ?)",
          [courseId, `Module 1: Introduction to ${courseTitle}`, 1],
        );

        const moduleId = moduleResult.insertId;
        console.log(`   ✅ Added Module 1 (ID: ${moduleId})`);

        // Add a lesson to the module
        const lessonTitle = `Getting Started with ${courseTitle}`;
        const lessonContent = `# ${lessonTitle}\n\n## Overview\nWelcome to ${courseTitle}! This introductory lesson covers the fundamentals and key concepts.\n\n## Learning Objectives\n- Understand the basics of ${courseTitle}\n- Learn core concepts and terminology\n- Prepare for advanced topics\n\n## Content\nThis is your first learning module. Complete the quiz below to test your understanding.`;

        const [lessonResult] = await connection.query(
          "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
          [moduleId, lessonTitle, lessonContent, 1],
        );

        const lessonId = lessonResult.insertId;
        console.log(`   ✅ Added Lesson 1 (ID: ${lessonId})`);

        // Add a quiz question
        const [questionResult] = await connection.query(
          "INSERT INTO quiz_questions (lesson_id, question_text, question_order) VALUES (?, ?, ?)",
          [lessonId, `What is ${courseTitle} fundamentally about?`, 1],
        );

        const questionId = questionResult.insertId;
        console.log(`   ✅ Added Quiz Question (ID: ${questionId})`);

        // Add quiz options (4 options, first one is correct)
        const options = [
          {
            text: `The fundamental principles and practices of ${courseTitle}`,
            isCorrect: 1,
          },
          {
            text: `An advanced topic beyond the scope of this course`,
            isCorrect: 0,
          },
          { text: `A programming language specific concept`, isCorrect: 0 },
          { text: `A deprecated technology no longer in use`, isCorrect: 0 },
        ];

        for (let i = 0; i < options.length; i++) {
          await connection.query(
            "INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
            [questionId, options[i].text, options[i].isCorrect],
          );
        }

        console.log(`   ✅ Added 4 quiz options (1 correct answer)\n`);
      } else {
        console.log(
          `✅ Course "${courseTitle}" (ID: ${courseId}) - Has ${moduleCount} module(s)`,
        );

        // Check if modules have lessons
        const [modulesData] = await connection.query(
          "SELECT id, title FROM modules WHERE course_id = ? ORDER BY module_order",
          [courseId],
        );

        for (const module of modulesData) {
          const [lessons] = await connection.query(
            "SELECT COUNT(*) as count FROM lessons WHERE module_id = ?",
            [module.id],
          );

          if (lessons[0].count === 0) {
            console.log(
              `   ⚠️ Module "${module.title}" has no lessons - Adding default lesson...`,
            );

            const lessonTitle = `Lesson 1: ${module.title}`;
            const lessonContent = `# ${lessonTitle}\n\n## Overview\nThis is an introductory lesson for ${module.title}.\n\n## Content\nComplete the quiz below to test your understanding.`;

            const [lessonResult] = await connection.query(
              "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
              [module.id, lessonTitle, lessonContent, 1],
            );

            const lessonId = lessonResult.insertId;
            console.log(`   ✅ Added Lesson (ID: ${lessonId})`);

            // Add quiz question
            const [questionResult] = await connection.query(
              "INSERT INTO quiz_questions (lesson_id, question_text, question_order) VALUES (?, ?, ?)",
              [lessonId, `What is the main topic of this lesson?`, 1],
            );

            const questionId = questionResult.insertId;

            // Add quiz options
            const options = [
              { text: `Understanding the core concepts`, isCorrect: 1 },
              { text: `Advanced configuration`, isCorrect: 0 },
              { text: `Troubleshooting`, isCorrect: 0 },
              { text: `Integration with external systems`, isCorrect: 0 },
            ];

            for (let i = 0; i < options.length; i++) {
              await connection.query(
                "INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
                [questionId, options[i].text, options[i].isCorrect],
              );
            }

            console.log(`   ✅ Added lesson with quiz\n`);
          }
        }
      }
    }

    console.log("\n✅ Content update complete!");
  } catch (error) {
    console.error("❌ Error adding missing content:", error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

addMissingContent();
