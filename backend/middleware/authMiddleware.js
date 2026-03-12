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
}

module.exports = new AuthMiddleware(process.env.JWT_SECRET || "dev_jwt_secret");
