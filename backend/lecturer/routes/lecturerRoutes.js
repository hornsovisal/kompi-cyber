const express = require("express");
const lecturerAuthController = require("../controller/lecturerAuthController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Lecturer authentication routes
router.post("/login", lecturerAuthController.loginLecturer);
router.post("/send-verification", lecturerAuthController.sendLecturerVerification);
router.post("/verify-email", lecturerAuthController.verifyLecturerEmail);
router.post("/forgot-password", lecturerAuthController.forgotLecturerPassword);
router.post("/reset-password", lecturerAuthController.resetLecturerPassword);

// Protected routes
router.get("/profile", authMiddleware, lecturerAuthController.getLecturerProfile);

// Admin routes (for managing lecturers)
router.get("/all", authMiddleware, lecturerAuthController.getAllLecturers);

module.exports = router;