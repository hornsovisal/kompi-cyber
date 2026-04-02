const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const courseController = require("../controller/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const { isConfigured, lessonBucket } = require("../config/supabase");

// Public course catalog routes.
router.get("/", courseController.getCourses);

// GET /api/courses/cover/:slug - MUST come before /:id route
// Serves course cover SVG images from local backend/upload/lesson directory with proper CORS headers
router.get("/cover/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Build path to local file: backend/upload/lesson/{slug}/cover.svg
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

    // Set CORS and resource policy headers for cross-origin image access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");

    // Read and send file with proper headers
    const fileContent = fs.readFileSync(filePath);
    res.send(fileContent);
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
