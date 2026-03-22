const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const emailService = require("../utils/emailService");

class AuthController {
  constructor(jwtSecret) {
    this.jwtSecret = jwtSecret;
  }

  signToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roleId: user.role_id,
      },
      this.jwtSecret,
      { expiresIn: "1h" },
    );
  }

  registerUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const created = await User.create({
        fullName: name,
        email,
        passwordHash: hashedPassword,
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await User.setVerificationToken(created.id, verificationToken);

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
          id: created.id,
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

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isPasswordMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      if (!user.is_verified) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
        });
      }

      const token = this.signToken(user);

      res.status(200).json({
        message: "Login successful",
        token,
        user: this.userModel.toSafeUser(user),
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

      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({
          message: "If an account with that email exists, a password reset link has been sent.",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      await User.setVerificationToken(user.id, resetToken);

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

      const verified = await User.verifyEmail(token);
      if (!verified) {
        return res.status(400).json({
          message: "Invalid or expired verification token",
        });
      }

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

      const user = await User.findByVerificationToken(token);
      if (!user || user.length === 0) {
        return res.status(400).json({
          message: "Invalid or expired reset token",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.update(user[0].id, { password_hash: hashedPassword });
      await User.setVerificationToken(user[0].id, null); // Clear the token

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
