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

// CORS configuration - supports both local development and production deployment
const corsOptions = {
  origin: (origin, callback) => {
    // Get allowed origins from environment or use defaults
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5000",
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      "https://kompi-cyber.vercel.app",
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log for debugging but allow in development
      if (process.env.NODE_ENV !== "production") {
        console.warn(`CORS warning - origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`CORS rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
};

// In production, restrict CORS to specific origins
if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
  corsOptions.origin = (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      "https://kompi-cyber.vercel.app",
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS rejected origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  };
}

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Caching middleware for static assets and API responses
app.use((req, res, next) => {
  // Cache static assets for 1 year (they have content hashes)
  if (req.url.match(/\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  // Cache API responses briefly (5 minutes) for expensive queries
  else if (req.method === "GET" && req.url.startsWith("/api/")) {
    res.setHeader("Cache-Control", "private, max-age=300");
  }
  next();
});

// Serve uploaded course assets like /upload/lesson/<slug>/cover.*
// Note: Primary storage is now Supabase (upload bucket for lessons/courses, certificates bucket for certs)
// This local path serves as fallback for local development
app.use(
  "/upload",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    next();
  },
  express.static(path.resolve(__dirname, "../upload"), {
    maxAge: "1d",
    etag: true,
  }),
);

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
      console.log(
        `Frontend URL: ${process.env.FRONTEND_URL || "not configured"}`,
      );
      console.log(
        `CORS Policy: ${process.env.NODE_ENV === "production" ? "Restricted to configured domains" : "Permissive for development"}`,
      );
      if (process.env.VERCEL_URL) {
        console.log(`Vercel URL: https://${process.env.VERCEL_URL}`);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
