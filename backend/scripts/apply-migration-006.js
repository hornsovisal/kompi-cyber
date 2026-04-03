const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function applyMigration() {
  let connection;
  try {
    console.log("🔄 Applying migration 006: Add missing columns to modules table...");
    
    // Create connection using environment variables
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "kompicyber",
    });
    
    console.log("✅ Connected to database");
    
    // Read the migration file
    const migrationPath = path.join(__dirname, "../../database/migrations/006_add_module_columns.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    // Split into individual statements (handle comments)
    const statements = migrationSQL
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith("--"));
    
    console.log(`Found ${statements.length} statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
      await connection.execute(statement);
      console.log("✅ Statement executed");
    }
    
    console.log("\n🎉 Migration 006 applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Error details:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Handle "no database" scenario gracefully
if (!process.env.DB_HOST) {
  console.warn("⚠️  DB_HOST not set. Skipping migration.");
  console.warn("Set environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
  process.exit(0);
}

applyMigration();
