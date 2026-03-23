const express = require("express");
const router = express.Router();

const certificateController = require("../controller/certificateController");
const authMiddleware = require("../middleware/authMiddleware");

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
