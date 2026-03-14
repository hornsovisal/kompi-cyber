const userModel = require("../models/userModel");

class UserController {
  constructor(model) {
    this.userModel = model;
  }

  getMe = async (req, res) => {
    try {
      const user = await this.userModel.findById(req.user.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ user: this.userModel.toSafeUser(user) });
    } catch (error) {
      console.error("getMe error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  updateMe = async (req, res) => {
    try {
      const { full_name, email } = req.body;
      const result = await this.userModel.updateUser(req.user.sub, {
        full_name,
        email,
      });

      if (!result) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updated = await this.userModel.findById(req.user.sub);
      return res.status(200).json({
        message: "Profile updated successfully",
        user: this.userModel.toSafeUser(updated),
      });
    } catch (error) {
      console.error("updateMe error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

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

  getUsers = async (req, res) => {
    try {
      const users = await this.userModel.findAllUsers();
      return res
        .status(200)
        .json({ users: users.map((u) => this.userModel.toSafeUser(u)) });
    } catch (error) {
      console.error("getUsers error:", error);
      return res.status(500).json({ message: "Server error" });
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

  patchUserStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active, status } = req.body;

      let normalized;
      if (typeof is_active === "boolean") normalized = is_active;
      else if (is_active === 1 || is_active === 0)
        normalized = Boolean(is_active);
      else if (typeof status === "string") {
        if (status === "active") normalized = true;
        if (status === "inactive") normalized = false;
      }

      if (normalized === undefined) {
        return res.status(400).json({
          message:
            "Provide is_active (boolean/0/1) or status ('active'|'inactive')",
        });
      }

      const existing = await this.userModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "User not found" });
      }

      await this.userModel.updateStatus(id, normalized);
      const updated = await this.userModel.findById(id);

      return res.status(200).json({
        message: "User status updated successfully",
        user: this.userModel.toSafeUser(updated),
      });
    } catch (error) {
      console.error("patchUserStatus error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  patchUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const roleId = Number(req.body.role_id ?? req.body.roleId);

      if (!Number.isInteger(roleId) || roleId <= 0) {
        return res.status(400).json({ message: "Valid role_id is required" });
      }

      const existing = await this.userModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "User not found" });
      }

      const roleExists = await this.userModel.roleExists(roleId);
      if (!roleExists) {
        return res.status(400).json({ message: "Role does not exist" });
      }

      await this.userModel.updateRole(id, roleId);
      const updated = await this.userModel.findById(id);

      return res.status(200).json({
        message: "User role updated successfully",
        user: this.userModel.toSafeUser(updated),
      });
    } catch (error) {
      console.error("patchUserRole error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new UserController(userModel);
