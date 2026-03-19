const db = require("../config/db");

// GET all courses
exports.getAllCourses = (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json({ success: true, data: results });
  });
};

// GET single course by ID
exports.getCourseById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM courses WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(404).json({ message: "Course not found" });
    res.json({ success: true, data: results[0] });
  });
};

// GET courses created by the logged in user
exports.getMyCourses = (req, res) => {
  const userId = req.user.id; // comes from token
  db.query("SELECT * FROM courses WHERE created_by = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json({ success: true, data: results });
  });
};