const express = require("express");
const app = express();
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseroutes");

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});