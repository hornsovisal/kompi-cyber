const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/register",
  authMiddleware.validateRegister,
  authController.registerUser,
);

router.post("/login", authMiddleware.validateLogin, authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationEmail);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
