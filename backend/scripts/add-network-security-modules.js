const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function addNetworkSecurityModules() {
  try {
    console.log("🚀 Starting Network Security Course Module Setup...\n");

    // Update course description
    const courseTitle = "Network Security Basics";
    const [courseRows] = await db.execute(
      "SELECT id FROM courses WHERE title = ? LIMIT 1",
      [courseTitle],
    );

    if (!courseRows[0]) {
      console.log(`✗ Course not found: ${courseTitle}`);
      return;
    }

    const courseId = courseRows[0].id;
    console.log(`✓ Found course: ${courseTitle} (ID: ${courseId})\n`);

    // Update course description
    const newDescription =
      "Comprehensive 6-week network security course covering packet analysis, attack detection, firewall hardening, VPN tunneling, network segmentation, and threat hunting with practical hands-on labs.";

    await db.execute("UPDATE courses SET description = ? WHERE id = ?", [
      newDescription,
      courseId,
    ]);
    console.log("✓ Updated course description\n");

    // Define modules and lessons
    const modulesData = [
      {
        week: 1,
        title: "Week 1: Network Fundamentals & Packet Analysis",
        file: "week1-packet-analysis.md",
      },
      {
        week: 2,
        title: "Week 2: Network Attacks & Intrusion Detection",
        file: "week2-network-attacks-detection.md",
      },
      {
        week: 3,
        title: "Week 3: Firewall Hardening & iptables",
        file: "week3-firewall-iptables.md",
      },
      {
        week: 4,
        title: "Week 4: VPN & Encrypted Tunnels",
        file: "week4-vpn-tunnels.md",
      },
      {
        week: 5,
        title: "Week 5: Network Segmentation & Zero Trust",
        file: "week5-segmentation-zero-trust.md",
      },
      {
        week: 6,
        title: "Week 6: Threat Hunting & Network Forensics",
        file: "week6-threat-hunting.md",
      },
    ];

    const uploadDir = path.join(
      __dirname,
      "../../upload/lesson/network-security",
    );

    // Process each module
    for (const moduleData of modulesData) {
      // Check for existing module to avoid duplicates
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

        // Delete existing lessons to replace them (with cascade delete)
        // Get lesson IDs first
        const [lessonIds] = await db.execute(
          "SELECT id FROM lessons WHERE module_id = ?",
          [moduleId],
        );

        for (const lesson of lessonIds) {
          // Delete quiz answers for this lesson's attempts FIRST (before deleting options/questions)
          await db.execute(
            "DELETE FROM quiz_answers WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE lesson_id = ?)",
            [lesson.id],
          );
          // Delete quiz options whose questions are for this lesson
          await db.execute(
            "DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE lesson_id = ?)",
            [lesson.id],
          );
          // Delete quiz attempts
          await db.execute("DELETE FROM quiz_attempts WHERE lesson_id = ?", [
            lesson.id,
          ]);
          // Delete quiz questions
          await db.execute("DELETE FROM quiz_questions WHERE lesson_id = ?", [
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

        // Finally delete lessons
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

      // Extract title from first markdown heading
      const heading = content
        .split("\n")
        .find((line) => line.trim().startsWith("# "))
        ?.replace(/^#\s+/, "")
        .trim();

      const lessonTitle = heading || moduleData.title;

      // Insert lesson
      const [lessonResult] = await db.execute(
        "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
        [moduleId, lessonTitle, content, 1],
      );

      console.log(`    ✓ Added lesson: "${lessonTitle}"`);
    }

    console.log("\n✅ Network Security Course modules setup complete!\n");

    // Show statistics
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
    console.log(
      `\n✨ Course "Network Security Basics" is now ready with dynamic content!`,
    );
    console.log("\n📚 Access via API: GET /api/lessons/course/${courseId}");
  } catch (error) {
    console.error("❌ Error setting up network security modules:", error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

addNetworkSecurityModules();
