const express = require("express");
const router = express.Router({ mergeParams: true }); // Important: allows access to courseId from parent route
const moduleController = require("../controller/moduleController");
const authMiddleware = require("../middleware/authMiddleware");

// All module routes require authentication
router.use(authMiddleware.authenticateToken);

// GET /api/courses/:courseId/modules - Get all modules for a course
router.get("/", moduleController.getModulesByCourse);

// GET /api/courses/:courseId/modules/:id - Get a specific module
router.get("/:id", moduleController.getModuleById);

// POST /api/courses/:courseId/modules - Create a new module
router.post("/", moduleController.createModule);

// PUT /api/courses/:courseId/modules/:id - Update a module
router.put("/:id", moduleController.updateModule);

// DELETE /api/courses/:courseId/modules/:id - Delete a module
router.delete("/:id", moduleController.deleteModule);

module.exports = router;
