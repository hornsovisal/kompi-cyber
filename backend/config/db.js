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