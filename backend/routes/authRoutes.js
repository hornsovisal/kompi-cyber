const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authMiddleware.validateRegister, (req, res) =>
  authController.registerUser(req, res),
);

router.post("/login", authMiddleware.validateLogin, (req, res) =>
  authController.loginUser(req, res),
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

module.exports = router;
