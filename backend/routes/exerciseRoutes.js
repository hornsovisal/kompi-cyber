const express = require("express");
const router = express.Router();

const exerciseController = require("../controller/exerciseController");
const authMiddleware = require("../middleware/authMiddleware");

// All exercise routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET /api/exercises/:id
router.get("/:id", exerciseController.getExerciseById);

// POST /api/exercises
router.post("/", exerciseController.createExercise);

// PUT /api/exercises/:id
router.put("/:id", exerciseController.updateExercise);

// DELETE /api/exercises/:id
router.delete("/:id", exerciseController.deleteExercise);

module.exports = router;
