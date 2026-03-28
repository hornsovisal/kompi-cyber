const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function addIntroCyberModules() {
  try {
    console.log("🚀 Starting Introduction to Cybersecurity Course Setup...\n");

    const courseTitle = "Introduction to Cybersecurity";
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
      "Comprehensive 7-week cybersecurity fundamentals course covering SOC operations, threat analysis, CIA Triad, identity management, malware analysis, cloud security, and incident response with practical hands-on labs using real tools like nmap, Wireshark, VirusTotal, and AWS.";

    await db.execute("UPDATE courses SET description = ? WHERE id = ?", [
      newDescription,
      courseId,
    ]);
    console.log("✓ Updated course description\n");

    // Define modules and lessons
    const modulesData = [
      {
        week: 1,
        title: "Week 1: Modern SOC & Threat Landscape",
        file: "week1-modern-soc-and-threat-landscape.md",
      },
      {
        week: 2,
        title: "Week 2: Analyzing Cyber Threats",
        file: "week2-analyzing-cyber-threats.md",
      },
      {
        week: 3,
        title: "Week 3: CIA Triad & Security Principles",
        file: "week3-cia-triad-security-principles.md",
      },
      {
        week: 4,
        title: "Week 4: Identity & Access Management",
        file: "week4-identity-and-access-management.md",
      },
      {
        week: 5,
        title: "Week 5: Malware Analysis",
        file: "week5-malware-analysis.md",
      },
      {
        week: 6,
        title: "Week 6: Cloud Security",
        file: "week6-cloud-security.md",
      },
      {
        week: 7,
        title: "Week 7: Incident Response Capstone",
        file: "week7-incident-response-capstone.md",
      },
    ];

    const uploadDir = path.join(
      __dirname,
      "../../upload/lesson/intro-to-cyber-course",
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

    console.log("\n✅ Introduction to Cybersecurity Course setup complete!\n");

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
    console.error("❌ Error setting up intro to cyber modules:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

addIntroCyberModules();
