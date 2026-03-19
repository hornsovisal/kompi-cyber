const express = require("express");
const router = express.Router();

const enrollmentController = require("../controller/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");

// Enrollment routes for learner-course membership management.
router.use(authMiddleware.authenticateToken);

// POST /api/enrollments — enroll in a course
router.post("/", enrollmentController.enroll);

// GET /api/enrollments/my — get all my enrollments
router.get("/my", enrollmentController.getMyEnrollments);

// GET /api/enrollments/check/:courseId — check if enrolled in a specific course
router.get("/check/:courseId", enrollmentController.checkEnrollment);

// DELETE /api/enrollments/:courseId — unenroll from a course
router.delete("/:courseId", enrollmentController.unenroll);

module.exports = router;
