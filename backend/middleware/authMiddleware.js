const jwt = require("jsonwebtoken");

class AuthMiddleware {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    next();
  };

  validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    next();
  };

  authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    try {
      const payload = jwt.verify(token, this.secretKey);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };

  requireAdmin = (req, res, next) => {
    const roleId = Number(req.user?.roleId);

    if (roleId !== 3) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  };

  // Require instructor/teacher role (typically roleId = 2)
  requireInstructor = (req, res, next) => {
    const roleId = Number(req.user?.roleId);
    const userId = req.user?.sub || req.user?.id;

    // Allow role 2 (instructor/teacher) or 3 (admin)
    if (roleId !== 2 && roleId !== 3) {
      return res.status(403).json({
        message: "Instructor or admin access required",
        roleId,
      });
    }

    // Make user ID available for later checks
    req.instructorId = userId;
    next();
  };

  // Require coordinator/curriculum designer role
  // Coordinators (roleId 4) can design and manage courses
  // Instructors (roleId 2) and admins (roleId 3) are also allowed
  requireCoordinator = (req, res, next) => {
    const roleId = Number(req.user?.roleId);
    const userId = req.user?.sub || req.user?.id;

    // Allow role 2 (instructor), 3 (admin), or 4 (coordinator)
    if (roleId !== 2 && roleId !== 3 && roleId !== 4) {
      return res.status(403).json({
        message: "Coordinator, instructor, or admin access required",
        roleId,
      });
    }

    req.coordinatorId = userId;
    next();
  };

  // Require student role
  requireStudent = (req, res, next) => {
    const roleId = Number(req.user?.roleId);

    if (roleId !== 1) {
      return res.status(403).json({
        message: "Student access required",
      });
    }

    next();
  };
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}

module.exports = new AuthMiddleware(jwtSecret || "dev_jwt_secret_change_me");
