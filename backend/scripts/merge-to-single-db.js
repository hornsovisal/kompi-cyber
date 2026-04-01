const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
  const cfg = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 8889,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
  };
  const oldDb = "kompi-cyber";
  const newDb = "kompi_cyber";

  const oldConn = await mysql.createConnection({ ...cfg, database: oldDb });
  const newConn = await mysql.createConnection({ ...cfg, database: newDb });

  const [oldUsers] = await oldConn.query(
    "SELECT id, full_name, email, password_hash, role_id, is_active, created_at, updated_at FROM users",
  );

  for (const user of oldUsers) {
    const [existing] = await newConn.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [user.email],
    );

    if (!existing.length) {
      await newConn.query(
        "INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          user.id,
          user.full_name,
          user.email,
          user.password_hash,
          user.role_id,
          user.is_active,
          user.created_at,
          user.updated_at,
        ],
      );
    }
  }

  const [oldEnrollments] = await oldConn.query(
    "SELECT e.course_id, e.enrolled_at, u.email FROM enrollments e JOIN users u ON u.id = e.user_id",
  );

  for (const row of oldEnrollments) {
    const [newUserRows] = await newConn.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [row.email],
    );

    if (newUserRows.length) {
      await newConn.query(
        "INSERT IGNORE INTO enrollments (user_id, course_id, enrolled_at) VALUES (?, ?, ?)",
        [newUserRows[0].id, row.course_id, row.enrolled_at],
      );
    }
  }

  const [courseCount] = await newConn.query(
    "SELECT COUNT(*) AS n FROM courses",
  );
  const [userCount] = await newConn.query("SELECT COUNT(*) AS n FROM users");
  const [quizCount] = await newConn.query(
    "SELECT COUNT(*) AS n FROM quiz_questions",
  );
  const [me] = await newConn.query(
    "SELECT id, email FROM users WHERE email = ? LIMIT 1",
    ["vathana@gmail.com"],
  );

  console.log(
    JSON.stringify(
      {
        targetDb: newDb,
        courses: courseCount[0].n,
        users: userCount[0].n,
        quiz_questions: quizCount[0].n,
        vathana: me[0] || null,
      },
      null,
      2,
    ),
  );

  await oldConn.end();
  await newConn.end();
}

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
