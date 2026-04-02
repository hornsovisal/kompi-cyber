const express = require("express");
const router = express.Router();

const courseController = require("../controller/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const { isConfigured, lessonBucket } = require("../config/supabase");

// Public course catalog routes.
router.get("/", courseController.getCourses);

// GET /api/courses/cover/:slug
// Proxies course cover SVG images from Supabase using signed URLs
// to enable cross-origin image loads
router.get("/cover/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!supabaseUrl || !isConfigured) {
      return res.status(503).json({ message: "Image storage not configured" });
    }

    const bucket = lessonBucket;
    const imageUrl = `${supabaseUrl}/storage/v1/object/sign/${bucket}/lesson/${slug}/cover.svg`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Set CORS and resource policy headers for cross-origin image access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");

    // Read response body and send with headers
    const buffer = await response.arrayBuffer();
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
