const express = require("express");
const router = express.Router();
const { enroll } = require("../controller/enrollmentController");

// POST /api/enrollments
router.post("/", enroll);

module.exports = router;