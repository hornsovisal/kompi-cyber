const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");

// Handles enrollment lifecycle: enroll, list, check, and unenroll.
class EnrollmentController {
  constructor(model, cModel) {
    this.enrollmentModel = model;
    this.courseModel = cModel;
  }

  enroll = async (req, res) => {
    try {
      const userId = req.user?.sub;
      const courseId = Number(req.body.course_id);

      if (!courseId || !Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Valid course_id is required" });
      }

      const course = await this.courseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Keep enroll idempotent for better UX on repeated clicks.
      const alreadyEnrolled = await this.enrollmentModel.isEnrolled(
        userId,
        courseId,
      );
      if (alreadyEnrolled) {
        return res
          .status(200)
          .json({ message: "Already enrolled", enrolled: true });
      }

      await this.enrollmentModel.enroll(userId, courseId);
      return res
        .status(201)
        .json({ message: "Enrolled successfully", enrolled: true });
    } catch (error) {
      console.error("enroll error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getMyEnrollments = async (req, res) => {
    try {
      const userId = req.user?.sub;
      const enrollments = await this.enrollmentModel.getByUserId(userId);
      return res.status(200).json({ enrollments });
    } catch (error) {
      console.error("getMyEnrollments error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  checkEnrollment = async (req, res) => {
    try {
      const userId = req.user?.sub;
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      const enrolled = await this.enrollmentModel.isEnrolled(userId, courseId);
      return res.status(200).json({ enrolled });
    } catch (error) {
      console.error("checkEnrollment error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  unenroll = async (req, res) => {
    try {
      const userId = req.user?.sub;
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      await this.enrollmentModel.unenroll(userId, courseId);
      return res.status(200).json({ message: "Unenrolled successfully" });
    } catch (error) {
      console.error("unenroll error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new EnrollmentController(enrollmentModel, courseModel);
