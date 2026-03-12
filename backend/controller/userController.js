const userModel = require("../models/userModel");

class UserController {
  constructor(model) {
    this.userModel = model;
  }

  getUser = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await this.userModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user: this.userModel.toSafeUser(user) });
    } catch (error) {
      console.error("getUser error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  updateUser = async (req, res) => {
    try {
      const { id } = req.params;

      // Only allow users to update their own profile
      if (req.user.sub !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { full_name, email } = req.body;
      const result = await this.userModel.updateUser(id, { full_name, email });

      if (!result) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updated = await this.userModel.findById(id);
      res.status(200).json({
        message: "User updated successfully",
        user: this.userModel.toSafeUser(updated),
      });
    } catch (error) {
      console.error("updateUser error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getUserProgress = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await this.userModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const progress = await this.userModel.getUserProgress(id);
      res.status(200).json({ userId: id, progress });
    } catch (error) {
      console.error("getUserProgress error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new UserController(userModel);
