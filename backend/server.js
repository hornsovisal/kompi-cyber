const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", req.body);
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
