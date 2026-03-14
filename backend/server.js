const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded course assets like /upload/lesson/<slug>/cover.*
app.use("/upload", express.static(path.resolve(__dirname, "../upload")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
