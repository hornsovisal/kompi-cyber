const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_LESSON_BUCKET = process.env.SUPABASE_LESSON_BUCKET || "upload";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function uploadCovers() {
  const uploadDir = path.join(__dirname, "../upload/lesson");

  // Read all directories in upload/lesson
  const dirs = fs.readdirSync(uploadDir);

  for (const dir of dirs) {
    const coverPath = path.join(uploadDir, dir, "cover.svg");

    // Skip if not a directory or cover.svg doesn't exist
    if (!fs.statSync(path.join(uploadDir, dir)).isDirectory()) continue;
    if (!fs.existsSync(coverPath)) {
      console.log(`⏭️  Skipping ${dir} - no cover.svg found`);
      continue;
    }

    try {
      const fileContent = fs.readFileSync(coverPath);
      const remoteFilePath = `lesson/${dir}/cover.svg`;

      const { data, error } = await supabase.storage
        .from(SUPABASE_LESSON_BUCKET)
        .upload(remoteFilePath, fileContent, {
          contentType: "image/svg+xml",
          upsert: true, // Overwrite if exists
        });

      if (error) {
        console.error(`❌ Error uploading ${dir}:`, error);
      } else {
        console.log(`✅ Uploaded: lesson/${dir}/cover.svg`);
      }
    } catch (error) {
      console.error(`❌ Failed to upload ${dir}:`, error.message);
    }
  }

  console.log("\n✅ Course covers uploaded to Supabase!");
}

uploadCovers();
