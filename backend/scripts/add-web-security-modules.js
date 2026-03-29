const db = require("../config/db");

const COURSE_ID = 4; // Web Application Security

const modules = [
  {
    title: "Web Application Security Fundamentals",
    module_order: 1,
  },
  {
    title: "Access Control & Cryptography",
    module_order: 2,
  },
  {
    title: "Injection & Insecure Design",
    module_order: 3,
  },
];

async function addWebSecurityModules() {
  try {
    console.log("Adding Web Application Security modules...");

    for (const module of modules) {
      const [result] = await db.execute(
        `INSERT INTO modules (course_id, title, module_order)
         VALUES (?, ?, ?)`,
        [COURSE_ID, module.title, module.module_order],
      );
      console.log(
        `✅ Module ${module.module_order}: ${module.title} (ID: ${result.insertId})`,
      );
    }

    console.log("\n✅ All modules added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding modules:", error);
    process.exit(1);
  }
}

addWebSecurityModules();
