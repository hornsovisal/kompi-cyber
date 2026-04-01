const courseModel = require("../models/courseModel");
const enrollmentModel = require("../models/enrollmentModel");

// Handles course catalog CRUD and course-level lesson access.
class CourseController {
  constructor(model) {
    this.courseModel = model;
  }
  getCourses = async (_req, res) => {
    try {
      await this.courseModel.ensureSeedFromUploadIfEmpty();
      const courses = await this.courseModel.findAll();
      return res.status(200).json({ courses });
    } catch (error) {
      console.error("getCourses error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getCourseById = async (req, res) => {
    try {
      await this.courseModel.ensureSeedFromUploadIfEmpty();
      const param = req.params.id;
      const numId = Number(param);

      let course;
      if (Number.isInteger(numId) && numId > 0) {
        // Numeric ID
        course = await this.courseModel.findById(numId);
      } else {
        // Slug (string)
        course = await this.courseModel.findBySlug(param);
      }

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json({ course });
    } catch (error) {
      console.error("getCourseById error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // This method is for admin use only, so it doesn't check enrollment
  createCourse = async (req, res) => {
    try {
      const {
        domain_id,
        title,
        description,
        cover_image_url,
        level,
        duration_hrs,
        is_published,
        course_type = "online-led",
      } = req.body;

      if (!domain_id || !title) {
        return res
          .status(400)
          .json({ message: "domain_id and title are required" });
      }

      // Validate course_type
      if (!["online-led", "instructor-led", "both"].includes(course_type)) {
        return res.status(400).json({
          message:
            "course_type must be 'online-led', 'instructor-led', or 'both'",
        });
      }

      const newId = await this.courseModel.createCourse({
        domain_id,
        title,
        description,
        cover_image_url,
        level,
        duration_hrs,
        is_published,
        course_type,
        created_by: req.user?.sub,
      });

      const course = await this.courseModel.findById(newId);
      return res
        .status(201)
        .json({ message: "Course created successfully", course });
    } catch (error) {
      console.error("createCourse error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  updateCourse = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      const existing = await this.courseModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Course not found" });
      }

      const result = await this.courseModel.updateCourse(id, req.body);
      if (!result) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updated = await this.courseModel.findById(id);
      return res
        .status(200)
        .json({ message: "Course updated successfully", course: updated });
    } catch (error) {
      console.error("updateCourse error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  deleteCourse = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      const existing = await this.courseModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Course not found" });
      }

      await this.courseModel.deleteCourse(id);
      return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("deleteCourse error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getCourseLessons = async (req, res) => {
    try {
      await this.courseModel.ensureSeedFromUploadIfEmpty();
      const param = req.params.courseId;
      const numId = Number(param);

      let course;
      if (Number.isInteger(numId) && numId > 0) {
        // Numeric ID
        course = await this.courseModel.findById(numId);
      } else {
        // Slug (string)
        course = await this.courseModel.findBySlug(param);
      }

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Learners can browse courses, but lesson lists require enrollment.
      const userId = req.user?.sub;
      const enrolled = await enrollmentModel.isEnrolled(userId, course.id);
      if (!enrolled) {
        return res.status(403).json({
          message: "You must enroll in this course to access its lessons",
          enrolled: false,
        });
      }

<<<<<<< HEAD
      const [lessons, modules] = await Promise.all([
        this.courseModel.getLessonsByCourse(courseId),
        this.courseModel.getModulesByCourse(courseId),
      ]);

      return res.status(200).json({ courseId, lessons, modules });
=======
      const lessons = await this.courseModel.getLessonsByCourse(course.id);
      return res.status(200).json({ courseId: course.id, lessons });
>>>>>>> main
    } catch (error) {
      console.error("getCourseLessons error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Get course by slug (NEW - security through obscured IDs)
  getCourseBySlug = async (req, res) => {
    try {
      await this.courseModel.ensureSeedFromUploadIfEmpty();
      const slug = String(req.params.slug).trim();
      if (!slug || slug.length === 0) {
        return res.status(400).json({ message: "Invalid course slug" });
      }

      const course = await this.courseModel.findBySlug(slug);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json({ course });
    } catch (error) {
      console.error("getCourseBySlug error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new CourseController(courseModel);
