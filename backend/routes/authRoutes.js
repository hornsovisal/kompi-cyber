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

module.exports = router;
