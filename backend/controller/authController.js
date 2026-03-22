const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../utils/emailService");

// In-memory storage for demo purposes (replace with database in production)
let users = [];
let verificationTokens = new Map();
let resetTokens = new Map();

class AuthController {
  constructor(jwtSecret) {
    this.jwtSecret = jwtSecret;
  }

  signToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roleId: user.roleId || 1,
      },
      this.jwtSecret,
      { expiresIn: "1h" },
    );
  }

  registerUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = crypto.randomUUID();
      const newUser = {
        id: userId,
        fullName: name,
        email,
        passwordHash: hashedPassword,
        roleId: 1,
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      users.push(newUser);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      verificationTokens.set(verificationToken, userId);

      // Send verification email
      try {
        await emailService.sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail registration if email fails
      }

      res.status(201).json({
        message: "User registered successfully. Please check your email to verify your account.",
        user: {
          id: userId,
          name,
          email,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
        });
      }

      const token = this.signToken(user);

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleId: user.roleId,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;

      const user = users.find(u => u.email === email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({
          message: "If an account with that email exists, a password reset link has been sent.",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      resetTokens.set(resetToken, user.id);

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(500).json({
          message: "Failed to send reset email",
        });
      }

      res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const { token } = req.body;

      const userId = verificationTokens.get(token);
      if (!userId) {
        return res.status(400).json({
          message: "Invalid or expired verification token",
        });
      }

      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      user.isVerified = true;
      verificationTokens.delete(token);

      res.status(200).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { token, password } = req.body;

      const userId = resetTokens.get(token);
      if (!userId) {
        return res.status(400).json({
          message: "Invalid or expired reset token",
        });
      }

      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.passwordHash = hashedPassword;
      resetTokens.delete(token);

      res.status(200).json({
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };
}

module.exports = new AuthController(
  process.env.JWT_SECRET || "dev_jwt_secret",
);
