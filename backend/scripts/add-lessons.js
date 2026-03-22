const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function addLessonsToExistingCourses() {
  try {
    // Define new lessons to add
    const lessonsToAdd = [
      {
        courseTitle: "Introduction to Cybersecurity",
        modules: [
          {
            order: 6,
            files: ["module-6-malware-and-viruses.md"],
          },
          {
            order: 7,
            files: ["module-7-cloud-security.md"],
          },
        ],
      },
      {
        courseTitle: "Introduction to Linux",
        modules: [
          {
            order: 4,
            files: ["module-4-linux-advanced-security.md"],
          },
        ],
      },
      {
        courseTitle: "Network Security",
        modules: [
          {
            order: 3,
            files: ["course3-module3-intrusion-detection.md"],
          },
        ],
      },
      {
        courseTitle: "Web Application Security",
        modules: [
          {
            order: 3,
            files: ["course4-module3-api-security.md"],
          },
        ],
      },
      {
        courseTitle: "Incident Response",
        modules: [
          {
            order: 3,
            files: ["course5-module3-recovery-restoration.md"],
          },
        ],
      },
    ];

    // Process each course
    for (const courseData of lessonsToAdd) {
      // Get course ID by title
      const [courseRows] = await db.execute(
        "SELECT id FROM courses WHERE title = ? LIMIT 1",
        [courseData.courseTitle],
      );

      if (!courseRows[0]) {
        console.log(`✗ Course not found: ${courseData.courseTitle}`);
        continue;
      }

      const courseId = courseRows[0].id;
      console.log(`Processing: ${courseData.courseTitle} (ID: ${courseId})`);

      // Process modules for this course
      for (const module of courseData.modules) {
        // Check if module exists
        const [existingModule] = await db.execute(
          "SELECT id FROM modules WHERE course_id = ? AND module_order = ? LIMIT 1",
          [courseId, module.order],
        );

        let moduleId;
        if (existingModule[0]) {
          moduleId = existingModule[0].id;
          console.log(
            `  Module ${module.order}: Using existing (ID: ${moduleId})`,
          );
        } else {
          const [moduleResult] = await db.execute(
            "INSERT INTO modules (course_id, title, module_order) VALUES (?, ?, ?)",
            [courseId, `Module ${module.order}`, module.order],
          );
          moduleId = moduleResult.insertId;
          console.log(`  Module ${module.order}: Created (ID: ${moduleId})`);
        }

        // Add lessons for this module
        for (const file of module.files) {
          // Determine the correct upload path based on course
          const uploadPaths = [
            `/home/whitecyber/D_drive/Y2/Term2/Web_Develoment/kompi-cyber/upload/lesson/intro-to-cyber-course/${file}`,
            `/home/whitecyber/D_drive/Y2/Term2/Web_Develoment/kompi-cyber/upload/lesson/intro-to-linux-course/${file}`,
            `/home/whitecyber/D_drive/Y2/Term2/Web_Develoment/kompi-cyber/upload/lesson/network-security/${file}`,
            `/home/whitecyber/D_drive/Y2/Term2/Web_Develoment/kompi-cyber/upload/lesson/web-security/${file}`,
            `/home/whitecyber/D_drive/Y2/Term2/Web_Develoment/kompi-cyber/upload/lesson/incident-response/${file}`,
          ];

          let filePath = null;
          for (const p of uploadPaths) {
            if (fs.existsSync(p)) {
              filePath = p;
              break;
            }
          }

          if (!filePath) {
            console.log(`    ✗ File not found: ${file}`);
            continue;
          }

          const content = fs.readFileSync(filePath, "utf8");
          const heading = content
            .split("\n")
            .find((line) => line.trim().startsWith("# "))
            ?.replace(/^#\s+/, "")
            .trim();

          // Get lesson count to determine order
          const [lessonCount] = await db.execute(
            "SELECT COUNT(*) as total FROM lessons WHERE module_id = ?",
            [moduleId],
          );
          const lessonOrder = Number(lessonCount[0].total) + 1;

          // Check if lesson already exists
          const [existingLesson] = await db.execute(
            "SELECT id FROM lessons WHERE module_id = ? AND title = ? LIMIT 1",
            [moduleId, heading],
          );

          if (existingLesson[0]) {
            console.log(`    ✓ Lesson already exists: ${heading}`);
          } else {
            await db.execute(
              "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
              [moduleId, heading, content, lessonOrder],
            );
            console.log(`    ✓ Added: ${heading}`);
          }
        }
      }
    }

    console.log("\n✓ All lessons updated successfully!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

addLessonsToExistingCourses();
