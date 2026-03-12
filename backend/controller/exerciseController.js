const exerciseModel = require("../models/exerciseModel");

class ExerciseController {
  constructor(model) {
    this.exerciseModel = model;
  }

  getExercisesByLesson = async (req, res) => {
    try {
      const lessonId = Number(req.params.lessonId);
      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return res.status(400).json({ message: "Invalid lessonId" });
      }

      const exercises = await this.exerciseModel.getByLessonId(lessonId);
      return res.status(200).json({ lessonId, exercises });
    } catch (error) {
      console.error("getExercisesByLesson error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getExerciseById = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid exercise id" });
      }

      const exercise = await this.exerciseModel.findById(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      return res.status(200).json({ exercise });
    } catch (error) {
      console.error("getExerciseById error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  createExercise = async (req, res) => {
    try {
      const {
        lesson_id,
        title,
        instructions_md,
        starter_code,
        language,
        time_limit_ms,
        memory_limit_mb,
      } = req.body;

      if (!lesson_id || !title) {
        return res
          .status(400)
          .json({ message: "lesson_id and title are required" });
      }

      const newId = await this.exerciseModel.createExercise({
        lesson_id,
        title,
        instructions_md,
        starter_code,
        language,
        time_limit_ms,
        memory_limit_mb,
      });

      const created = await this.exerciseModel.findById(newId);
      return res
        .status(201)
        .json({ message: "Exercise created successfully", exercise: created });
    } catch (error) {
      console.error("createExercise error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  updateExercise = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid exercise id" });
      }

      const existing = await this.exerciseModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const result = await this.exerciseModel.updateExercise(id, req.body);
      if (!result) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updated = await this.exerciseModel.findById(id);
      return res
        .status(200)
        .json({ message: "Exercise updated successfully", exercise: updated });
    } catch (error) {
      console.error("updateExercise error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  deleteExercise = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid exercise id" });
      }

      const existing = await this.exerciseModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      await this.exerciseModel.deleteExercise(id);
      return res.status(200).json({ message: "Exercise deleted successfully" });
    } catch (error) {
      console.error("deleteExercise error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new ExerciseController(exerciseModel);
