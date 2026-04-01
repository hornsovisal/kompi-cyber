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
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  ...(sslConfig && { ssl: sslConfig }),
});

module.exports = pool;
