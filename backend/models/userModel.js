const { randomUUID } = require("crypto");
const db = require("../config/db");

class UserModel {
  constructor(database) {
    this.db = database;
  }

  async findUserByEmail(email) {
    const [rows] = await this.db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    return rows;
  }

  async createUser(name, email, passwordHash, roleId = 1, isActive = 1) {
    const userId = randomUUID();

    const [result] = await this.db.execute(
      `INSERT INTO users (id, full_name, email, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, email, passwordHash, roleId, isActive],
    );

    return { id: userId, affectedRows: result.affectedRows };
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  }

  async findAllUsers() {
    const [rows] = await this.db.execute(
      `SELECT
         u.id,
         u.full_name,
         u.email,
         u.role_id,
         r.name AS role_name,
         u.is_active,
         u.created_at,
         u.updated_at
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`,
    );

    return rows;
  }

  async updateUser(id, fields) {
    const allowed = ["full_name", "email"];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));

    if (keys.length === 0) return null;

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = [...keys.map((k) => fields[k]), id];

    const [result] = await this.db.execute(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values,
    );

    return result;
  }

  async getUserProgress(userId) {
    const [rows] = await this.db.execute(
      `SELECT
         lp.lesson_id,
         l.title        AS lesson_title,
         lp.status,
         lp.completed_at
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       WHERE lp.user_id = ?
       ORDER BY lp.completed_at DESC`,
      [userId],
    );
    return rows;
  }

  async updateStatus(id, isActive) {
    const [result] = await this.db.execute(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [isActive ? 1 : 0, id],
    );

    return result;
  }

  async updateRole(id, roleId) {
    const [result] = await this.db.execute(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [roleId, id],
    );

    return result;
  }

  async roleExists(roleId) {
    const [rows] = await this.db.execute(
      "SELECT id FROM roles WHERE id = ? LIMIT 1",
      [roleId],
    );

    return rows.length > 0;
  }

  toSafeUser(userRow) {
    if (!userRow) return null;

    return {
      id: userRow.id,
      fullName: userRow.full_name,
      email: userRow.email,
      roleId: userRow.role_id,
      roleName: userRow.role_name,
      isActive: Boolean(userRow.is_active),
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
    };
  }
}

module.exports = new UserModel(db);
