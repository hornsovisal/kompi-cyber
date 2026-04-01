const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
  override: true,
});

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseroutes");
const lessonRoutes = require("./routes/lessonRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const studentRoutes = require("./routes/studentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const invitationRoutes = require("./routes/invitationRoutes");

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploaded course assets like /upload/lesson/<slug>/cover.*
// Note: Primary storage is now Supabase (upload-lesson bucket for lessons, certificates bucket for certs)
// This local path serves as fallback for local development
app.use("/upload", express.static(path.resolve(__dirname, "../upload")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/invitations", invitationRoutes);

// Global error handler - prevent sensitive info exposure
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Don't expose error details in production
  if (process.env.NODE_ENV === "production") {
    return res.status(err.status || 500).json({
      success: false,
      message: "Internal Server Error",
      status: err.status || 500,
    });
  }

  // In development, provide more details
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    status: err.status || 500,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    status: 404,
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Try to connect to database, but don't fail if it doesn't work
    try {
      await db.query("SELECT 1");
      if (process.env.NODE_ENV !== "production") {
        console.log("Database connected successfully.");
      }
    } catch (dbError) {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Database not available, running with in-memory storage for authentication.",
        );
      }
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
