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

  toSafeUser(userRow) {
    if (!userRow) return null;

    return {
      id: userRow.id,
      fullName: userRow.full_name,
      email: userRow.email,
      roleId: userRow.role_id,
      isActive: Boolean(userRow.is_active),
      createdAt: userRow.created_at,
      updatedAt: userRow.updated_at,
    };
  }
}

module.exports = new UserModel(db);
