const express = require("express");
const router = express.Router();

const certificateController = require("../controller/certificateController");
const authMiddleware = require("../middleware/authMiddleware");

// Test endpoint - check Supabase connection
router.get("/test/upload", async (req, res) => {
  try {
    const supabase = require("../config/superbase");

    const testBuffer = Buffer.from("Test PDF content");
    const testFilename = `test-${Date.now()}.pdf`;

    console.log("Testing Supabase upload...");

    const uploadResult = await supabase.storage
      .from("certificates")
      .upload(testFilename, testBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    console.log("Upload result:", uploadResult);

    if (uploadResult.error) {
      return res.status(500).json({
        message: "Upload failed",
        error: uploadResult.error,
      });
    }

    const publicUrlResult = supabase.storage
      .from("certificates")
      .getPublicUrl(testFilename);

    return res.json({
      message: "Upload successful",
      filename: testFilename,
      publicUrl: publicUrlResult.data.publicUrl,
    });
  } catch (error) {
    console.error("Test upload error:", error);
    return res.status(500).json({
      message: "Error during test upload",
      error: error.message,
    });
  }
});

// All routes require authentication
router.use(authMiddleware.authenticateToken);

// Generate certificate for a course (when completed)
// POST /api/certificates/generate/:courseId
router.post("/generate/:courseId", certificateController.generateCertificate);

// Get certificate for a specific course
// GET /api/certificates/course/:courseId
router.get("/course/:courseId", certificateController.getCertificate);

// Get all certificates for the logged-in user
// GET /api/certificates/my
router.get("/my", certificateController.getMyMyCertificates);

// Get completion status and stats for a course
// GET /api/certificates/status/:courseId
router.get("/status/:courseId", certificateController.getCompletionStatus);

module.exports = router;
