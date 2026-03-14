const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");

// All user routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET  /api/users/:id
router.get("/:id", userController.getUser);

// PUT  /api/users/:id
router.put("/:id", userController.updateUser);

// GET  /api/users/:id/progress
router.get("/:id/progress", userController.getUserProgress);

module.exports = router;
