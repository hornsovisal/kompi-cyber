const {
  client: supabase,
  lessonBucket: SUPABASE_LESSON_BUCKET,
  isConfigured: SUPABASE_CONFIGURED,
} = require("../config/supabase");
const fs = require("fs");
const path = require("path");

/**
 * Save lesson file locally as fallback
 * @param {string} courseSlug - Course slug
 * @param {string} fileName - File name
 * @param {Buffer|string} fileContent - File content
 * @returns {string} Relative URL path
 */
function saveLessonLocally(courseSlug, fileName, fileContent) {
  const safeSlug = String(courseSlug || "unknown").replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  const relativeDir = path.join("upload", "lesson", safeSlug);
  const absoluteDir = path.resolve(__dirname, "../../", relativeDir);

  fs.mkdirSync(absoluteDir, { recursive: true });
  const absoluteFilePath = path.join(absoluteDir, fileName);
  fs.writeFileSync(absoluteFilePath, fileContent);

  return `/upload/lesson/${safeSlug}/${fileName}`;
}

/**
 * Upload lesson file to Supabase Storage
 * @param {string} courseSlug - Course slug
 * @param {string} fileName - File name
 * @param {Buffer|string} fileContent - File content
 * @param {string} contentType - MIME type (default: application/octet-stream)
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadLessonFile(
  courseSlug,
  fileName,
  fileContent,
  contentType = "application/octet-stream",
) {
  const safeSlug = String(courseSlug || "unknown").replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  const filePath = `${safeSlug}/${fileName}`;

  if (!SUPABASE_CONFIGURED) {
    console.warn(
      "⚠️ Supabase not configured, using local storage for lesson file",
    );
    return saveLessonLocally(courseSlug, fileName, fileContent);
  }

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_LESSON_BUCKET)
      .upload(filePath, fileContent, {
        contentType,
        upsert: true, // overwrite if exists
      });

    if (error) {
      throw error;
    }

    // Get the public URL after upload
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_LESSON_BUCKET)
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      console.log(`✅ Lesson file uploaded to Supabase: ${filePath}`);
      return publicUrlData.publicUrl;
    }

    throw new Error("Supabase did not return a public URL.");
  } catch (error) {
    console.warn(
      `⚠️ Supabase upload failed, falling back to local storage: ${error.message}`,
    );
    return saveLessonLocally(courseSlug, fileName, fileContent);
  }
}

/**
 * Delete lesson file from Supabase
 * @param {string} courseSlug - Course slug
 * @param {string} fileName - File name
 * @returns {Promise<boolean>} Success status
 */
async function deleteLessonFile(courseSlug, fileName) {
  if (!SUPABASE_CONFIGURED) {
    console.warn("⚠️ Supabase not configured, cannot delete remote file");
    return false;
  }

  const safeSlug = String(courseSlug || "unknown").replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  const filePath = `${safeSlug}/${fileName}`;

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_LESSON_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    console.log(`✅ Lesson file deleted from Supabase: ${filePath}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Failed to delete Supabase file: ${error.message}`);
    return false;
  }
}

/**
 * Determine content type based on file extension
 * @param {string} fileName - File name
 * @returns {string} MIME type
 */
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".html": "text/html",
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".zip": "application/zip",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

module.exports = {
  uploadLessonFile,
  deleteLessonFile,
  saveLessonLocally,
  getContentType,
};
