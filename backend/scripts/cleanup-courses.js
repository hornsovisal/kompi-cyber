const db = require("../config/db");

async function cleanupAndResetCourses() {
  try {
    console.log("🧹 Starting complete cleanup of all courses...\n");

    // Course titles to reset (match exact database names)
    const courses = [
      "Introduction to Cybersecurity",
      "Ethical Hacking Essentials",
      "Network Security Basics",
      "Web Application Security",
      "Incident Response & Forensics",
    ];

    for (const courseTitle of courses) {
      console.log(`Cleaning: ${courseTitle}`);

      // Get course ID
      const [courseRows] = await db.execute(
        "SELECT id FROM courses WHERE title = ? LIMIT 1",
        [courseTitle],
      );

      if (!courseRows[0]) {
        console.log(`  ✗ Course not found\n`);
        continue;
      }

      const courseId = courseRows[0].id;

      // Get all modules for this course
      const [modules] = await db.execute(
        "SELECT id FROM modules WHERE course_id = ?",
        [courseId],
      );

      console.log(`  Found ${modules.length} modules to clean\n`);

      // Delete all related data for each module's lessons
      for (const module of modules) {
        const [lessons] = await db.execute(
          "SELECT id FROM lessons WHERE module_id = ?",
          [module.id],
        );

        for (const lesson of lessons) {
          // Delete quiz answers
          await db.execute(
            "DELETE FROM quiz_answers WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE lesson_id = ?)",
            [lesson.id],
          );

          // Delete quiz options
          await db.execute(
            "DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE lesson_id = ?)",
            [lesson.id],
          );

          // Delete quiz questions
          await db.execute("DELETE FROM quiz_questions WHERE lesson_id = ?", [
            lesson.id,
          ]);

          // Delete quiz attempts
          await db.execute("DELETE FROM quiz_attempts WHERE lesson_id = ?", [
            lesson.id,
          ]);

          // Delete lesson progress
          await db.execute("DELETE FROM lesson_progress WHERE lesson_id = ?", [
            lesson.id,
          ]);

          // Delete exercise test cases
          await db.execute(
            "DELETE FROM exercise_test_cases WHERE exercise_id IN (SELECT id FROM exercises WHERE lesson_id = ?)",
            [lesson.id],
          );

          // Delete exercise submissions
          await db.execute(
            "DELETE FROM exercise_submissions WHERE exercise_id IN (SELECT id FROM exercises WHERE lesson_id = ?)",
            [lesson.id],
          );

          // Delete exercises
          await db.execute("DELETE FROM exercises WHERE lesson_id = ?", [
            lesson.id,
          ]);
        }

        // Delete lessons
        await db.execute("DELETE FROM lessons WHERE module_id = ?", [
          module.id,
        ]);
      }

      // Delete all modules
      await db.execute("DELETE FROM modules WHERE course_id = ?", [courseId]);

      console.log(`  ✓ Cleaned all data for ${courseTitle}\n`);
    }

    console.log("✅ Cleanup complete! Ready for fresh course population.\n");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

cleanupAndResetCourses();
