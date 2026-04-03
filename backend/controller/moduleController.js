const db = require("../config/db");

class ModuleController {
  // Get all modules for a course
  getModulesByCourse = async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);
      console.log("getModulesByCourse called with courseId:", courseId);
      console.log("req.params:", req.params);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course id" });
      }

      const query = `
        SELECT 
          id,
          course_id,
          title,
          description,
          module_order,
          created_at,
          updated_at,
          (SELECT COUNT(*) FROM lessons WHERE module_id = modules.id) as lessonCount
        FROM modules
        WHERE course_id = ?
        ORDER BY module_order ASC, id ASC
      `;

      console.log("Executing query for courseId:", courseId);
      const [modules] = await db.execute(query, [courseId]);
      console.log("Query result:", modules);

      res.json({
        success: true,
        data: modules || [],
      });
    } catch (error) {
      console.error("Error fetching modules:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      res.status(500).json({
        success: false,
        message: "Failed to fetch modules",
        error:
          process.env.NODE_ENV !== "production" ? error.message : undefined,
      });
    }
  };

  // Get a single module by ID
  getModuleById = async (req, res) => {
    try {
      const moduleId = Number(req.params.id);
      if (!Number.isInteger(moduleId) || moduleId <= 0) {
        return res.status(400).json({ message: "Invalid module id" });
      }

      const query = `
        SELECT 
          id,
          course_id,
          title,
          description,
          module_order,
          created_at,
          updated_at,
          (SELECT COUNT(*) FROM lessons WHERE module_id = modules.id) as lessonCount
        FROM modules
        WHERE id = ?
      `;

      const [modules] = await db.execute(query, [moduleId]);

      if (!modules || modules.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      res.json({
        success: true,
        data: modules[0],
      });
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch module",
        error:
          process.env.NODE_ENV !== "production" ? error.message : undefined,
      });
    }
  };

  // Create a new module
  createModule = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title, description, module_order } = req.body;
      const instructorId = req.user?.sub || req.user?.id;

      if (!instructorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      // Verify the course belongs to the instructor
      const [courses] = await db.execute(
        "SELECT id, created_by FROM courses WHERE id = ?",
        [courseId],
      );

      if (!courses || courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (courses[0].created_by !== instructorId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to add modules to this course",
        });
      }

      // Get the next module order
      const [maxOrder] = await db.execute(
        "SELECT MAX(module_order) as max_order FROM modules WHERE course_id = ?",
        [courseId],
      );
      const nextOrder = (maxOrder[0]?.max_order || 0) + 1;

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const query = `
        INSERT INTO modules (course_id, title, description, slug, module_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.execute(query, [
        courseId,
        title.trim(),
        description?.trim() || null,
        slug,
        nextOrder,
      ]);

      if (!result.insertId) {
        return res.status(500).json({
          success: false,
          message: "Failed to create module",
        });
      }

      // Fetch and return the created module
      const [newModule] = await db.execute(
        "SELECT * FROM modules WHERE id = ?",
        [result.insertId],
      );

      res.status(201).json({
        success: true,
        message: "Module created successfully",
        data: newModule[0],
      });
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create module",
        error:
          process.env.NODE_ENV !== "production" ? error.message : undefined,
      });
    }
  };

  // Update a module
  updateModule = async (req, res) => {
    try {
      const { courseId, id: moduleId } = req.params;
      const { title, description, module_order } = req.body;
      const instructorId = req.user?.sub || req.user?.id;

      if (!instructorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!Number.isInteger(Number(moduleId)) || Number(moduleId) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid module id",
        });
      }

      // Verify the course belongs to the instructor
      const [courses] = await db.execute(
        "SELECT id, created_by FROM courses WHERE id = ?",
        [courseId],
      );

      if (!courses || courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (courses[0].created_by !== instructorId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to modify modules in this course",
        });
      }

      // Check if module exists and belongs to this course
      const [modules] = await db.execute(
        "SELECT id, course_id FROM modules WHERE id = ? AND course_id = ?",
        [moduleId, courseId],
      );

      if (!modules || modules.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];

      if (title !== undefined) {
        updateFields.push("title = ?");
        updateValues.push(title.trim());
      }
      if (description !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(description.trim());
      }
      if (module_order !== undefined) {
        updateFields.push("module_order = ?");
        updateValues.push(module_order);
      }

      updateFields.push("updated_at = NOW()");

      if (updateFields.length === 1) {
        // Only updated_at, no changes
        return res.status(400).json({
          success: false,
          message: "No fields to update",
        });
      }

      const updateQuery = `UPDATE modules SET ${updateFields.join(", ")} WHERE id = ?`;
      updateValues.push(moduleId);

      await db.execute(updateQuery, updateValues);

      // Fetch and return updated module
      const [updatedModule] = await db.execute(
        "SELECT * FROM modules WHERE id = ?",
        [moduleId],
      );

      res.json({
        success: true,
        message: "Module updated successfully",
        data: updatedModule[0],
      });
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update module",
        error:
          process.env.NODE_ENV !== "production" ? error.message : undefined,
      });
    }
  };

  // Delete a module
  deleteModule = async (req, res) => {
    try {
      const { courseId, id: moduleId } = req.params;
      const instructorId = req.user?.sub || req.user?.id;

      if (!instructorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!Number.isInteger(Number(moduleId)) || Number(moduleId) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid module id",
        });
      }

      // Verify the course belongs to the instructor
      const [courses] = await db.execute(
        "SELECT id, created_by FROM courses WHERE id = ?",
        [courseId],
      );

      if (!courses || courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (courses[0].created_by !== instructorId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete modules in this course",
        });
      }

      // Check if module exists
      const [modules] = await db.execute(
        "SELECT id, course_id FROM modules WHERE id = ? AND course_id = ?",
        [moduleId, courseId],
      );

      if (!modules || modules.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // Delete associated lessons first (cascade delete)
      await db.execute("DELETE FROM lessons WHERE module_id = ?", [moduleId]);

      // Delete the module
      await db.execute("DELETE FROM modules WHERE id = ?", [moduleId]);

      res.json({
        success: true,
        message: "Module deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete module",
        error:
          process.env.NODE_ENV !== "production" ? error.message : undefined,
      });
    }
  };
}

module.exports = new ModuleController();
