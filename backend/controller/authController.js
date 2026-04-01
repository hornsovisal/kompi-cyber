const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../utils/emailService");
const userModel = require("../models/userModel");

class AuthController {
  constructor(jwtSecret) {
    this.jwtSecret = jwtSecret;
    this.userModel = userModel;
  }

  signToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roleId: user.role_id || user.roleId || 1,
      },
      this.jwtSecret,
      { expiresIn: "1h" },
    );
  }

  signActionToken(userId, action, expiresIn) {
    return jwt.sign(
      {
        sub: userId,
        action,
        nonce: crypto.randomBytes(16).toString("hex"),
      },
      this.jwtSecret,
      { expiresIn },
    );
  }

  verifyActionToken(token, expectedAction) {
    const payload = jwt.verify(token, this.jwtSecret);

    if (payload.action !== expectedAction || !payload.sub) {
      throw new Error("INVALID_ACTION_TOKEN");
    }

    return payload.sub;
  }

  registerUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existing = await this.userModel.findUserByEmail(email);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // is_active = 0 until email is verified
      const { id: userId } = await this.userModel.createUser(name, email, hashedPassword, 1, 0);

      const verificationToken = this.signActionToken(userId, "verify-email", "24h");

      let verificationResult = null;
      try {
        verificationResult = await emailService.sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail registration if email fails
      }

      const responsePayload = {
        message: "User registered successfully. Please check your email to verify your account.",
        user: { id: userId, name, email },
      };

      if (!emailService.smtpConfigured && verificationResult?.url) {
        responsePayload.verificationLink = verificationResult.url;
      }

      res.status(201).json(responsePayload);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      const rows = await this.userModel.findUserByEmail(email);
      const user = rows[0];
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.is_active) {
        return res.status(403).json({ message: "Please verify your email before logging in" });
      }

      const token = this.signToken(user);

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          roleId: user.role_id,
          isActive: user.is_active,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;

      const rows = await this.userModel.findUserByEmail(email);
      const user = rows[0];
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({
          message: "If an account with that email exists, a password reset link has been sent.",
        });
      }

      const resetToken = this.signActionToken(user.id, "reset-password", "1h");

      try {
        await emailService.sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      let userId;
      try {
        userId = this.verifyActionToken(token, "verify-email");
      } catch (tokenError) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      await this.userModel.activateUser(userId);

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  resendVerificationEmail = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const rows = await this.userModel.findUserByEmail(email);
      const user = rows[0];

      // Keep a generic response when user is missing to avoid email enumeration.
      if (!user) {
        return res.status(200).json({
          message: "If an account exists and is not verified, a verification email has been sent.",
        });
      }

      if (user.is_active) {
        return res.status(400).json({ message: "This email is already verified" });
      }

      const verificationToken = this.signActionToken(user.id, "verify-email", "24h");

      let verificationResult = null;
      try {
        verificationResult = await emailService.sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error("Resend verification email failed:", emailError);
      }

      const responsePayload = {
        message: "Verification email sent. Please check your inbox.",
      };

      if (!emailService.smtpConfigured && verificationResult?.url) {
        responsePayload.verificationLink = verificationResult.url;
      }

      return res.status(200).json(responsePayload);
    } catch (error) {
      console.error("Resend verification error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Reset token is required" });
      }

      let userId;
      try {
        userId = this.verifyActionToken(token, "reset-password");
      } catch (tokenError) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userModel.updatePassword(userId, hashedPassword);

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new AuthController(
  process.env.JWT_SECRET || "dev_jwt_secret",
);
