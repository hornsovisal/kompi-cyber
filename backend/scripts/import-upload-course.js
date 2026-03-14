const fs = require("fs/promises");
const path = require("path");

const db = require("../config/db");

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function slugToTitle(slug) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function ensureDomain(name, description) {
  const [rows] = await db.execute(
    "SELECT id FROM domains WHERE name = ? LIMIT 1",
    [name],
  );

  if (rows[0]?.id) {
    return rows[0].id;
  }

  const [result] = await db.execute(
    "INSERT INTO domains (name, description) VALUES (?, ?)",
    [name, description],
  );
  return result.insertId;
}

async function getCreatorId() {
  const [adminRows] = await db.execute(
    `SELECT u.id
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE r.name = 'admin'
     ORDER BY u.created_at ASC
     LIMIT 1`,
  );

  if (adminRows[0]?.id) {
    return adminRows[0].id;
  }

  const [userRows] = await db.execute(
    "SELECT id FROM users ORDER BY created_at ASC LIMIT 1",
  );
  return userRows[0]?.id || null;
}

async function loadModuleFiles(uploadDir) {
  const files = await fs.readdir(uploadDir);

  return files
    .filter((fileName) => /^module-\d+-.+\.md$/i.test(fileName))
    .sort((left, right) => {
      const leftOrder = Number(left.match(/^module-(\d+)-/i)?.[1] || 0);
      const rightOrder = Number(right.match(/^module-(\d+)-/i)?.[1] || 0);
      return leftOrder - rightOrder;
    });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const slug = String(args.slug || "").trim();
  if (!slug) {
    throw new Error(
      'Missing --slug. Example: npm run import:course -- --slug intro-to-linux-course --title "Introduction to Linux" --domain "Linux Fundamentals"',
    );
  }

  const courseTitle = String(args.title || slugToTitle(slug)).trim();
  const domainName = String(args.domain || "General").trim();
  const description = String(
    args.description || `Imported from /upload/lesson/${slug}`,
  ).trim();
  const level = String(args.level || "beginner").trim();
  const durationHours = Number(args.duration || 0);
  const isPublished = Number(args.published || 1);

  const uploadDir = path.resolve(__dirname, `../../upload/lesson/${slug}`);

  const [existingCourse] = await db.execute(
    "SELECT id FROM courses WHERE title = ? LIMIT 1",
    [courseTitle],
  );
  if (existingCourse[0]?.id) {
    console.log(
      JSON.stringify(
        {
          message: "Course already exists",
          courseId: existingCourse[0].id,
          title: courseTitle,
        },
        null,
        2,
      ),
    );
    return;
  }

  const moduleFiles = await loadModuleFiles(uploadDir);
  if (moduleFiles.length === 0) {
    throw new Error(`No module markdown files found in ${uploadDir}`);
  }

  const creatorId = await getCreatorId();
  if (!creatorId) {
    throw new Error("No user found to assign as course creator");
  }

  const domainId = await ensureDomain(
    domainName,
    `${domainName} course domain imported from upload files.`,
  );

  const [courseInsert] = await db.execute(
    `INSERT INTO courses (
      domain_id,
      title,
      description,
      level,
      duration_hrs,
      is_published,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      domainId,
      courseTitle,
      description,
      level,
      durationHours,
      isPublished,
      creatorId,
    ],
  );

  const courseId = courseInsert.insertId;

  for (let index = 0; index < moduleFiles.length; index += 1) {
    const fileName = moduleFiles[index];
    const filePath = path.join(uploadDir, fileName);
    const content = await fs.readFile(filePath, "utf8");
    const moduleOrder = index + 1;

    const heading = content
      .split("\n")
      .find((line) => line.trim().startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim();

    const fallbackTitle = slugToTitle(
      fileName.replace(/\.md$/i, "").replace(/^module-\d+-/i, ""),
    );
    const moduleTitle = heading || fallbackTitle;

    const [moduleInsert] = await db.execute(
      "INSERT INTO modules (course_id, title, module_order) VALUES (?, ?, ?)",
      [courseId, moduleTitle, moduleOrder],
    );

    await db.execute(
      "INSERT INTO lessons (module_id, title, content_md, lesson_order) VALUES (?, ?, ?, ?)",
      [moduleInsert.insertId, moduleTitle, content, 1],
    );
  }

  console.log(
    JSON.stringify(
      {
        message: "Course imported successfully",
        courseId,
        title: courseTitle,
        slug,
        modules: moduleFiles.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
