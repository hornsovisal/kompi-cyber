<<<<<<< HEAD
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "kompi_cyber",
  port: 8889
});

db.connect((err) => {
  if (err) {
    console.error("Connection error:", err);
  } else {
    console.log("MySQL Connected!");
  }
});

module.exports = db;
=======
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = db;
>>>>>>> dffd624371c9cc6c26a2e07e01e21c05f928641f
