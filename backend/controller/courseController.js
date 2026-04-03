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

      // Get pagination parameters with defaults
      const page = Number(_req.query.page) || 1;
      const limit = Math.min(Number(_req.query.limit) || 20, 100); // Cap at 100
      const offset = (page - 1) * limit;

      // Get all courses and paginate client-side
      // TODO: Optimize by adding pagination to model layer
      const allCourses = await this.courseModel.findAll();
      const total = allCourses.length;
      const courses = allCourses.slice(offset, offset + limit);
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        courses,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
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

      const [lessons, modules] = await Promise.all([
        this.courseModel.getLessonsByCourse(course.id),
        this.courseModel.getModulesByCourse(course.id),
      ]);

      return res.status(200).json({ courseId: course.id, lessons, modules });
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

  // Clone a course - Teacher can create a copy of an existing course
  cloneCourse = async (req, res) => {
    try {
      const sourceId = Number(req.params.id);
      if (!Number.isInteger(sourceId) || sourceId <= 0) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      const sourceCourse = await this.courseModel.findById(sourceId);
      if (!sourceCourse) {
        return res.status(404).json({ message: "Source course not found" });
      }

      // Instructors can clone their own courses or any course in the system
      const userId = req.user?.sub;
      const roleId = Number(req.user?.roleId);

      // Only instructors and admins can clone courses
      if (roleId !== 2 && roleId !== 3) {
        return res
          .status(403)
          .json({ message: "Only instructors can clone courses" });
      }

      const { titleSuffix = `(Cloned by ${req.user?.email || "instructor"})` } =
        req.body;

      // Clone the course
      const newCourseId = await this.courseModel.cloneCourse(
        sourceId,
        userId,
        titleSuffix,
      );

      const clonedCourse = await this.courseModel.findById(newCourseId);
      return res.status(201).json({
        message: "Course cloned successfully",
        course: clonedCourse,
        sourceId,
        newCourseId,
      });
    } catch (error) {
      console.error("cloneCourse error:", error);
      return res.status(500).json({
        message: "Error cloning course",
        error: error.message,
      });
    }
  };
}

module.exports = new CourseController(courseModel);
