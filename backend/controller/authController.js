const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

class AuthController {
  constructor(model, jwtSecret) {
    this.userModel = model;
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

      const existingUsers = await this.userModel.findUserByEmail(email);
      if (existingUsers.length > 0) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const created = await this.userModel.createUser(
        name,
        email,
        hashedPassword,
      );

      res.status(201).json({
        message: "User registered successfully",
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

      const users = await this.userModel.findUserByEmail(email);
      if (users.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const user = users[0];
      const isPasswordMatch = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isPasswordMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
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
}

module.exports = new AuthController(
  userModel,
  process.env.JWT_SECRET || "dev_jwt_secret",
);
