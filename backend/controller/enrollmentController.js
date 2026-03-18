const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");

async function enroll(req, res) {
  try {
    const courseId = Number(req.body.course_id);
    if (!courseId) return res.status(400).json({ message: "Invalid course_id" });

    const course = await courseModel.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const userId = 1; // replace with req.user.sub if auth is implemented

    if (await enrollmentModel.isEnrolled(userId, courseId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    await enrollmentModel.enroll(userId, courseId);

    res.status(201).json({ message: "Enrolled successfully", course });
  } catch (err) {
    console.error("enroll error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { enroll };