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

  getMyDashboardSummary = async (req, res) => {
    try {
      const summary = await this.userModel.getDashboardSummary(req.user.sub);
      return res.status(200).json(summary);
    } catch (error) {
      console.error("getMyDashboardSummary error:", error);
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

  deleteMe = async (req, res) => {
    try {
      const userId = req.user.sub;

      const existing = await this.userModel.findById(userId);
      if (!existing) {
        return res.status(404).json({ message: "User not found" });
      }

      const result = await this.userModel.deleteUserAccount(userId);

      if (result?.blocked) {
        return res.status(409).json({
          message:
            "Account cannot be deleted while you still own courses. Transfer or remove your courses first.",
          blockedBy: "owned_courses",
        });
      }

      if (!result?.deleted) {
        return res.status(500).json({ message: "Failed to delete account" });
      }

      return res.status(200).json({
        message: result.softDeleted
          ? "Account deleted successfully"
          : "Account deleted successfully",
        mode: result.softDeleted ? "soft-delete" : "hard-delete",
      });
    } catch (error) {
      console.error("deleteMe error:", error);
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

  createUserAsAdmin = async (req, res) => {
    try {
      const bcrypt = require("bcryptjs");
      const { full_name, email, password, role_id } = req.body;

      // Validate input
      if (!full_name || !email || !password || !role_id) {
        return res.status(400).json({
          message: "full_name, email, password, and role_id are required",
        });
      }

      // Only allow creating teacher (2) or coordinator (4)
      const allowedRoles = [2, 4];
      if (!allowedRoles.includes(Number(role_id))) {
        return res.status(400).json({
          message: "role_id must be 2 (teacher) or 4 (coordinator)",
        });
      }

      // Check if email already exists
      const existing = await this.userModel.findUserByEmail(email);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (is_active = 1, no email verification needed)
      const { id: userId } = await this.userModel.createUser(
        full_name,
        email,
        hashedPassword,
        role_id,
        1, // is_active = 1
      );

      // Get created user
      const newUser = await this.userModel.findById(userId);

      return res.status(201).json({
        message: "User created successfully",
        user: this.userModel.toSafeUser(newUser),
      });
    } catch (error) {
      console.error("createUserAsAdmin error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getAllUsers = async (req, res) => {
    try {
      const db = require("../config/db");
      const [users] = await db.execute(
        `SELECT id, full_name, email, role_id, is_active, created_at FROM users ORDER BY created_at DESC`,
      );

      const roleMap = {
        1: "student",
        2: "teacher",
        3: "admin",
        4: "coordinator",
      };
      const usersWithRoles = users.map((user) => ({
        ...user,
        role: roleMap[user.role_id] || "unknown",
      }));

      return res.status(200).json({
        success: true,
        data: usersWithRoles,
      });
    } catch (error) {
      console.error("getAllUsers error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getUsersByRole = async (req, res) => {
    try {
      const { role_id } = req.params;
      const db = require("../config/db");

      if (!role_id || isNaN(role_id)) {
        return res.status(400).json({ message: "Invalid role_id" });
      }

      const [users] = await db.execute(
        `SELECT id, full_name, email, role_id, is_active, created_at FROM users WHERE role_id = ? ORDER BY created_at DESC`,
        [role_id],
      );

      const roleMap = {
        1: "student",
        2: "teacher",
        3: "admin",
        4: "coordinator",
      };
      const usersWithRoles = users.map((user) => ({
        ...user,
        role: roleMap[user.role_id] || "unknown",
      }));

      return res.status(200).json({
        success: true,
        data: usersWithRoles,
      });
    } catch (error) {
      console.error("getUsersByRole error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  updateUserAsAdmin = async (req, res) => {
    try {
      const { userId } = req.params;
      const { role_id, is_active } = req.body;
      const db = require("../config/db");

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      // Build update query
      const updates = [];
      const values = [];

      if (role_id !== undefined) {
        const validRoles = [1, 2, 3, 4];
        if (!validRoles.includes(Number(role_id))) {
          return res.status(400).json({ message: "Invalid role_id" });
        }
        updates.push("role_id = ?");
        values.push(role_id);
      }

      if (is_active !== undefined) {
        updates.push("is_active = ?");
        values.push(is_active ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updates.push("updated_at = NOW()");
      values.push(userId);

      const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
      await db.execute(query, values);

      const [updated] = await db.execute(
        `SELECT id, full_name, email, role_id, is_active FROM users WHERE id = ?`,
        [userId],
      );

      if (!updated || updated.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const roleMap = {
        1: "student",
        2: "teacher",
        3: "admin",
        4: "coordinator",
      };
      const user = updated[0];
      user.role = roleMap[user.role_id];

      return res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      console.error("updateUserAsAdmin error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  deleteUserAsAdmin = async (req, res) => {
    try {
      const { userId } = req.params;
      const db = require("../config/db");

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      // Prevent deleting self
      if (userId === req.user?.sub || userId === req.user?.id) {
        return res
          .status(403)
          .json({ message: "Cannot delete your own account" });
      }

      // Check if user exists
      const [user] = await db.execute(`SELECT id FROM users WHERE id = ?`, [
        userId,
      ]);
      if (!user || user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete user
      await db.execute(`DELETE FROM users WHERE id = ?`, [userId]);

      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("deleteUserAsAdmin error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new UserController(userModel);
