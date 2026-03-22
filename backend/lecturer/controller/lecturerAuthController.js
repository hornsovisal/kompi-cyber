const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const lecturerModel = require("../models/lecturerModel");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../../utils/emailService");

class LecturerAuthController {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "your-lecturer-jwt-secret";
  }

  signToken(lecturer) {
    return jwt.sign(
      {
        sub: lecturer.id,
        email: lecturer.email,
        role: "lecturer",
        department: lecturer.department,
        employeeId: lecturer.employeeId
      },
      this.jwtSecret,
      { expiresIn: "7d" }
    );
  }

  // Lecturer login
  loginLecturer = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find lecturer by email
      const lecturers = await lecturerModel.findLecturerByEmail(email);
      if (lecturers.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const lecturer = lecturers[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, lecturer.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      // Check if email is verified
      if (!lecturer.isVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in"
        });
      }

      // Generate token
      const token = this.signToken(lecturer);

      res.status(200).json({
        message: "Login successful",
        token,
        lecturer: {
          id: lecturer.id,
          name: lecturer.name,
          email: lecturer.email,
          department: lecturer.department,
          employeeId: lecturer.employeeId
        }
      });
    } catch (error) {
      console.error("Lecturer login error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  };

  // Send verification email to lecturer
  sendLecturerVerification = async (req, res) => {
    try {
      const { email } = req.body;

      const lecturers = await lecturerModel.findLecturerByEmail(email);
      if (lecturers.length === 0) {
        return res.status(404).json({
          message: "Lecturer not found"
        });
      }

      const lecturer = lecturers[0];

      if (lecturer.isVerified) {
        return res.status(400).json({
          message: "Email already verified"
        });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Update lecturer with verification token
      await lecturerModel.updateLecturerVerification(lecturer.id, false, verificationToken);

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      res.status(200).json({
        message: "Verification email sent successfully"
      });
    } catch (error) {
      console.error("Send verification error:", error);
      res.status(500).json({
        message: "Failed to send verification email"
      });
    }
  };

  // Verify lecturer email
  verifyLecturerEmail = async (req, res) => {
    try {
      const { token } = req.body;

      const lecturer = await lecturerModel.findLecturerByVerificationToken(token);
      if (!lecturer) {
        return res.status(400).json({
          message: "Invalid or expired verification token"
        });
      }

      // Update lecturer as verified
      await lecturerModel.updateLecturerVerification(lecturer.id, true, null);

      res.status(200).json({
        message: "Email verified successfully"
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  };

  // Forgot password for lecturer
  forgotLecturerPassword = async (req, res) => {
    try {
      const { email } = req.body;

      const lecturers = await lecturerModel.findLecturerByEmail(email);
      if (lecturers.length === 0) {
        return res.status(404).json({
          message: "Lecturer not found"
        });
      }

      const lecturer = lecturers[0];

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update lecturer with reset token
      await lecturerModel.setLecturerResetToken(lecturer.id, resetToken, resetTokenExpiry);

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);

      res.status(200).json({
        message: "Password reset email sent successfully"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        message: "Failed to send password reset email"
      });
    }
  };

  // Reset lecturer password
  resetLecturerPassword = async (req, res) => {
    try {
      const { token, password } = req.body;

      const lecturer = await lecturerModel.findLecturerByResetToken(token);
      if (!lecturer) {
        return res.status(400).json({
          message: "Invalid or expired reset token"
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update lecturer password
      await lecturerModel.updateLecturerPassword(lecturer.id, hashedPassword);

      res.status(200).json({
        message: "Password reset successfully"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  };

  // Get lecturer profile
  getLecturerProfile = async (req, res) => {
    try {
      const lecturerId = req.user.sub;
      const lecturer = await lecturerModel.findLecturerById(lecturerId);

      if (!lecturer) {
        return res.status(404).json({
          message: "Lecturer not found"
        });
      }

      res.status(200).json({
        lecturer: {
          id: lecturer.id,
          name: lecturer.name,
          email: lecturer.email,
          department: lecturer.department,
          employeeId: lecturer.employeeId,
          isVerified: lecturer.isVerified
        }
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  };

  // Get all lecturers (admin function)
  getAllLecturers = async (req, res) => {
    try {
      const lecturers = await lecturerModel.getAllLecturers();
      res.status(200).json({
        lecturers
      });
    } catch (error) {
      console.error("Get all lecturers error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  };
}

module.exports = new LecturerAuthController();