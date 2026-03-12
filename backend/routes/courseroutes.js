const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/my-courses", authenticate, courseController.getMyCourses);
router.get("/", authenticate, courseController.getAllCourses);
router.get("/:id", authenticate, courseController.getCourseById);

module.exports = router;