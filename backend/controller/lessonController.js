const lessonModel = require("../models/lessonModel");
const enrollmentModel = require("../models/enrollmentModel");

// Handles lesson CRUD and lesson-level access control.
class LessonController {
  constructor(model) {
    this.lessonModel = model;
  }

  getLessonById = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid lesson id" });
      }

      const lesson = await this.lessonModel.findById(id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Lesson content is only available to users enrolled in the lesson course.
      const userId = req.user?.sub;
      const enrolled = await enrollmentModel.isEnrolled(
        userId,
        lesson.course_id,
      );
      if (!enrolled) {
        return res.status(403).json({
          message: "You must enroll in this course to access its lessons",
          enrolled: false,
        });
      }

      return res.status(200).json({ lesson });
    } catch (error) {
      console.error("getLessonById error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  createLesson = async (req, res) => {
    try {
      const { module_id, title, content_md, lesson_order } = req.body;

      if (!module_id || !title || lesson_order === undefined) {
        return res
          .status(400)
          .json({ message: "module_id, title and lesson_order are required" });
      }

      const newId = await this.lessonModel.createLesson({
        module_id,
        title,
        content_md,
        lesson_order,
      });

      const lesson = await this.lessonModel.findById(newId);
      return res
        .status(201)
        .json({ message: "Lesson created successfully", lesson });
    } catch (error) {
      console.error("createLesson error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  updateLesson = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid lesson id" });
      }

      const existing = await this.lessonModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const result = await this.lessonModel.updateLesson(id, req.body);
      if (!result) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updated = await this.lessonModel.findById(id);
      return res
        .status(200)
        .json({ message: "Lesson updated successfully", lesson: updated });
    } catch (error) {
      console.error("updateLesson error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  deleteLesson = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid lesson id" });
      }

      const existing = await this.lessonModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      await this.lessonModel.deleteLesson(id);
      return res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
      console.error("deleteLesson error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new LessonController(lessonModel);
