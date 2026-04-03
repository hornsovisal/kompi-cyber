const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");

// All user routes require a valid JWT
router.use(authMiddleware.authenticateToken);

// GET  /api/users/me
router.get("/me", userController.getMe);

// GET /api/users/me/dashboard-summary
router.get("/me/dashboard-summary", userController.getMyDashboardSummary);

// PUT  /api/users/me
router.put("/me", userController.updateMe);

// DELETE /api/users/me
router.delete("/me", userController.deleteMe);

// GET  /api/users (admin only)
router.get("/", authMiddleware.requireAdmin, userController.getUsers);

// POST /api/users (admin only - create coordinator or teacher)
router.post("/", authMiddleware.requireAdmin, userController.createUserAsAdmin);

// PATCH /api/users/:id/status (admin only)
router.patch(
  "/:id/status",
  authMiddleware.requireAdmin,
  userController.patchUserStatus,
);

// PATCH /api/users/:id/role (admin only)
router.patch(
  "/:id/role",
  authMiddleware.requireAdmin,
  userController.patchUserRole,
);

// GET  /api/users/:id
router.get("/:id", userController.getUser);

// PUT  /api/users/:id
router.put("/:id", userController.updateUser);

// GET  /api/users/:id/progress
router.get("/:id/progress", userController.getUserProgress);

module.exports = router;
