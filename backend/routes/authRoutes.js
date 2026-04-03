const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");
const ValidationMiddleware = require("../middleware/validationMiddleware");

// Registration with strong password validation
router.post(
  "/register",
  ValidationMiddleware.strictLimiter,
  ValidationMiddleware.validateRegister,
  (req, res) => authController.registerUser(req, res),
);

// Login with rate limiting
router.post(
  "/login",
  ValidationMiddleware.loginLimiter,
  ValidationMiddleware.validateLogin,
  (req, res) => authController.loginUser(req, res),
);

router.post("/forgot-password", (req, res) =>
  authController.forgotPassword(req, res),
);

router.post("/verify-email", (req, res) =>
  authController.verifyEmail(req, res),
);

router.post("/resend-verification", (req, res) =>
  authController.resendVerificationEmail(req, res),
);

router.post("/reset-password", (req, res) =>
  authController.resetPassword(req, res),
);

// Create first admin account (only if no admins exist)
router.post("/create-admin", (req, res) =>
  authController.createFirstAdmin(req, res),
);

module.exports = router;
