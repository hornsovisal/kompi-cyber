const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Build SSL configuration conditionally
let sslConfig = false;

// Try to use certificate from env var, or fallback to local file
let certPath = process.env.DB_SSL_CA || path.join(__dirname, "aiven-ca.pem");

try {
  const ca = fs.readFileSync(certPath, "utf8");
  sslConfig = {
    ca: ca,
    rejectUnauthorized: true,
  };
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Using SSL certificate for database connection");
  }
} catch (err) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️  Warning: Could not read SSL certificate, connecting without SSL verification",
    );
  }
  sslConfig = {
    rejectUnauthorized: false,
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === "production" ? 20 : 10,
  maxIdle: process.env.NODE_ENV === "production" ? 10 : 5,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  decimalNumbers: true, // Handle large numbers properly
  ...(sslConfig && { ssl: sslConfig }),
});

module.exports = pool;
