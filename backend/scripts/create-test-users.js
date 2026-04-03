/**
 * Create test user accounts for development/testing
 * Usage: node create-test-users.js
 */

const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const db = require("../config/db");
require("dotenv").config();

const testUsers = [
  {
    name: "Teacher One",
    email: "teacher1@example.com",
    password: "Teacher@123",
    roleId: 2, // instructor
  },
  {
    name: "Teacher Two",
    email: "teacher2@example.com",
    password: "Teacher@456",
    roleId: 2, // instructor
  },
  {
    name: "Cordinator User",
    email: "coordinator@example.com",
    password: "Coordinator@789",
    roleId: 4, // coordinator
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin@2026",
    roleId: 3, // admin
  },
];

const createTestUsers = async () => {
  try {
    console.log("🔄 Creating test users...\n");

    for (const user of testUsers) {
      try {
        // Check if user exists
        const [existing] = await db.execute(
          "SELECT id FROM users WHERE email = ?",
          [user.email],
        );

        if (existing.length > 0) {
          console.log(`⏭️  User already exists: ${user.email}`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Create user
        const userId = randomUUID();
        await db.execute(
          `INSERT INTO users (id, full_name, email, password_hash, role_id, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, user.name, user.email, hashedPassword, user.roleId, 1],
        );

        const roleNames = {
          2: "Teacher/Instructor",
          3: "Admin",
          4: "Coordinator",
        };

        console.log(`✅ Created ${roleNames[user.roleId]}: ${user.email}`);
        console.log(`   Password: ${user.password}\n`);
      } catch (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }

    console.log("✨ Test user creation complete!");
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
};

createTestUsers();
