const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function addIntroLinuxModules() {
  try {
    console.log("🚀 Starting Introduction to Linux Course Setup...\n");

    const courseTitle = "Ethical Hacking Essentials";
    const [courseRows] = await db.execute(
      "SELECT id FROM courses WHERE title = ? LIMIT 1",
      [courseTitle],
    );

    if (!courseRows[0]) {
      console.log(`✗ Course not found: ${courseTitle}`);
      await db.end();
      process.exit(1);
    }

    const courseId = courseRows[0].id;
    console.log(`✓ Found course: ${courseTitle} (ID: ${courseId})\n`);

    // Update course description
    const newDescription =
      "Comprehensive 4-week Linux security fundamentals course covering terminal fundamentals, hardening, firewall configuration, and monitoring with practical hands-on labs using tools like auditd, fail2ban, Lynis, UFW, and iptables for production security";

    await db.execute("UPDATE courses SET description = ? WHERE id = ?", [
      newDescription,
      courseId,
    ]);
    console.log("✓ Updated course description\n");

    // Define modules and lessons
    const modulesData = [
      {
        week: 1,
        title: "Week 1: Linux Fundamentals & Secure Terminal",
        file: "week1-linux-fundamentals-security.md",
      },
      {
        week: 2,
        title: "Week 2: Hardening & Password Security",
        file: "week2-hardening-password-security.md",
      },
      {
        week: 3,
        title: "Week 3: Firewall Configuration & Network Security",
        file: "week3-firewall-network-security.md",
      },
      {
        week: 4,
        title: "Week 4: Monitoring, Auditing & Incident Response",
        file: "week4-monitoring-auditing-response.md",
      },
    ];

    const uploadDir = path.join(
      __dirname,
      "../../upload/lesson/intro-to-linux-course",
    );

    // Process each module
    for (const moduleData of modulesData) {
      const [existingModule] = await db.execute(
        "SELECT id FROM modules WHERE course_id = ? AND module_order = ? LIMIT 1",
        [courseId, moduleData.week],
      );

      let moduleId;
      if (existingModule[0]) {
        moduleId = existingModule[0].id;
        console.log(
          `  ℹ Module ${moduleData.week} already exists (ID: ${moduleId})`,
        );

        // Delete with proper cascade
        const [lessonIds] = await db.execute(
          "SELECT id FROM lessons WHERE module_id = ?",
          [moduleId],
        );

        for (const lesson of lessonIds) {
          await db.execute(
            "DELETE FROM quiz_answers WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE lesson_id = ?)",
            [lesson.id],
          );
          await db.execute(
            "DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE lesson_id = ?)",
            [lesson.id],
          );
          await db.execute("DELETE FROM quiz_attempts WHERE lesson_id = ?", [
            lesson.id,
          ]);
          await db.execute("DELETE FROM quiz_questions WHERE lesson_id = ?", [
            lesson.id,
          ]);
          await db.execute("DELETE FROM lesson_progress WHERE lesson_id = ?", [
            lesson.id,
          ]);
          await db.execute(
            "DELETE FROM exercise_test_cases WHERE exercise_id IN (SELECT id FROM exercises WHERE lesson_id = ?)",
            [lesson.id],
          );
          await db.execute(
            "DELETE FROM exercise_submissions WHERE exercise_id IN (SELECT id FROM exercises WHERE lesson_id = ?)",
            [lesson.id],
          );
          await db.execute("DELETE FROM exercises WHERE lesson_id = ?", [
            lesson.id,
          ]);
        }
        await db.execute("DELETE FROM lessons WHERE module_id = ?", [moduleId]);
        console.log(`    ✓ Cleared existing lessons and related data`);
      } else {
        const [moduleResult] = await db.execute(
          "INSERT INTO modules (course_id, title, module_order) VALUES (?, ?, ?)",
          [courseId, moduleData.title, moduleData.week],
        );
        moduleId = moduleResult.insertId;
        console.log(
          `  ✓ Created module ${moduleData.week}: "${moduleData.title}"`,
        );
      }

      // Read and add lesson
      const filePath = path.join(uploadDir, moduleData.file);

      if (!fs.existsSync(filePath)) {
        console.log(`    ✗ File not found: ${moduleData.file} at ${filePath}`);
        continue;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const heading = content
        .split("\n")
        .find((line) => line.trim().startsWith("# "))
        ?.replace(/^#\s+/, "")
        .trim();

      const lessonTitle = heading || moduleData.title;

      await db.execute(
        "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
        [moduleId, lessonTitle, content, 1],
      );

      console.log(`    ✓ Added lesson: "${lessonTitle}"`);
    }

    console.log("\n✅ Introduction to Linux Course setup complete!\n");

    const [moduleCount] = await db.execute(
      "SELECT COUNT(*) as total FROM modules WHERE course_id = ?",
      [courseId],
    );
    const [lessonCount] = await db.execute(
      "SELECT COUNT(*) as total FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)",
      [courseId],
    );

    console.log("📊 Course Statistics:");
    console.log(`   - Total Modules: ${moduleCount[0].total}`);
    console.log(`   - Total Lessons: ${lessonCount[0].total}`);
    console.log(`\n✨ Course ready with dynamic content!`);
  } catch (error) {
    console.error("❌ Error setting up intro to linux modules:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

addIntroLinuxModules();
