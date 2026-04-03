/**
 * Input Validation & Sanitization Middleware
 * Addresses OWASP Top 10 security concerns:
 * - A1: Injection attacks
 * - A3: Cross-Site Scripting (XSS)
 * - A4: Insecure Deserialization
 */

const validator = require("validator");
const rateLimit = require("express-rate-limit");

class ValidationMiddleware {
  /**
   * Sanitize string input to prevent XSS and injection attacks
   */
  static sanitizeString(str) {
    if (typeof str !== "string") {
      return str;
    }

    return validator.trim(str).replace(/[<>\"']/g, (match) => {
      const escapeMap = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      };
      return escapeMap[match];
    });
  }

  /**
   * Sanitize object properties recursively
   */
  static sanitizeObject(obj) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    if (typeof email !== "string") {
      return false;
    }
    return validator.isEmail(validator.trim(email));
  }

  /**
   * Validate password strength
   * - Minimum 8 characters
   * - At least 1 uppercase
   * - At least 1 lowercase
   * - At least 1 number
   * - At least 1 special character
   */
  static isStrongPassword(password) {
    if (typeof password !== "string" || password.length < 8) {
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * Validate URL to prevent open redirects
   */
  static isValidUrl(url, allowedOrigins = []) {
    if (typeof url !== "string") {
      return false;
    }

    try {
      const parsed = new URL(url);
      return (
        allowedOrigins.length === 0 || allowedOrigins.includes(parsed.origin)
      );
    } catch {
      return false;
    }
  }

  /**
   * Middleware to apply sanitization to request body and query
   */
  static sanitizeRequestData = (req, res, next) => {
    try {
      if (req.body && typeof req.body === "object") {
        req.body = ValidationMiddleware.sanitizeObject(req.body);
      }

      if (req.query && typeof req.query === "object") {
        req.query = ValidationMiddleware.sanitizeObject(req.query);
      }

      next();
    } catch (error) {
      console.error("Sanitization error:", error);
      return res.status(400).json({ message: "Invalid request format" });
    }
  };

  /**
   * Middleware for login validation
   */
  static validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!ValidationMiddleware.isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (typeof password !== "string" || password.length === 0) {
      return res.status(400).json({
        message: "Invalid password format",
      });
    }

    next();
  };

  /**
   * Middleware for registration validation
   */
  static validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        message: "Name must be a non-empty string",
      });
    }

    if (!ValidationMiddleware.isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (!ValidationMiddleware.isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    next();
  };

  /**
   * Rate limiting middleware for login attempts
   */
  static loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: "Too many login attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for authenticated users
      return req.user && req.user.sub;
    },
  });

  /**
   * Rate limiting middleware for API requests (general)
   */
  static apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: "Too many requests from this IP. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Strict rate limiting for sensitive operations
   */
  static strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: "Too many requests. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Validate numeric ID parameter
   */
  static validateNumericId = (req, res, next) => {
    const id = req.params.id || req.params.courseId || req.params.lessonId;
    const numId = Number(id);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res.status(400).json({
        message: "Invalid ID format. Must be a positive integer.",
      });
    }

    next();
  };

  /**
   * Validate pagination parameters
   */
  static validatePagination = (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return res.status(400).json({
        message: "Invalid page parameter. Must be a positive integer.",
      });
    }

    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        message: "Invalid limit parameter. Must be between 1 and 100.",
      });
    }

    req.pagination = { page: pageNum, limit: limitNum };
    next();
  };
}

module.exports = ValidationMiddleware;
