const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const courseController = require("../controller/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  isConfigured,
  lessonBucket,
  client: supabaseClient,
} = require("../config/supabase");

// Public course catalog routes.
router.get("/", courseController.getCourses);

// GET /api/courses/cover/:slug - MUST come before /:id route
// Serves course cover SVG images from Supabase storage with proper CORS headers
router.get("/cover/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // If Supabase is not configured, fallback to local filesystem
    if (!isConfigured) {
      const filePath = path.join(
        __dirname,
        "../upload/lesson",
        slug,
        "cover.svg",
      );

      // Security check: ensure the resolved path is within upload directory
      const uploadsDir = path.join(__dirname, "../upload");
      if (!filePath.startsWith(uploadsDir)) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Cover image not found" });
      }

      // Set CORS and resource policy headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400");

      const fileContent = fs.readFileSync(filePath);
      return res.send(fileContent);
    }

    // Fetch from Supabase: path is lesson/{slug}/cover.svg
    const supabaseFilePath = `lesson/${slug}/cover.svg`;
    console.log(`[DEBUG] Fetching from Supabase: ${supabaseFilePath}`);
    
    const { data, error } = await supabaseClient.storage
      .from(lessonBucket)
      .download(supabaseFilePath);

    if (error) {
      console.error(`[ERROR] Supabase fetch failed for ${supabaseFilePath}:`, error);
      // Fallback to local filesystem if Supabase fails
      const filePath = path.join(
        __dirname,
        "../upload/lesson",
        slug,
        "cover.svg",
      );

      if (fs.existsSync(filePath)) {
        console.log(`[FALLBACK] Using local file: ${filePath}`);
        const fileContent = fs.readFileSync(filePath);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(fileContent);
      }
      
      return res.status(404).json({ message: "Cover image not found" });
    }

    if (!data) {
      console.error(`[ERROR] No data returned from Supabase for ${supabaseFilePath}`);
      return res.status(404).json({ message: "Cover image not found" });
    }

    // Convert blob to buffer
    const buffer = await data.arrayBuffer();

    // Set CORS and resource policy headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");

    // Send file
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error fetching cover image:", error);
    res.status(500).json({ message: "Error fetching image" });
  }
});

// Public course details.
router.get("/:id", courseController.getCourseById);

// POST /api/courses (admin only)
router.post(
  "/",
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  courseController.createCourse,
);

// PUT /api/courses/:id (admin only)
router.put(
  "/:id",
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  courseController.updateCourse,
);

// DELETE /api/courses/:id (admin only)
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  courseController.deleteCourse,
);

// GET /api/courses/:courseId/lessons
router.get(
  "/:courseId/lessons",
  authMiddleware.authenticateToken,
  courseController.getCourseLessons,
);

module.exports = router;
