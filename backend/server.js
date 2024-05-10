"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jobRoutes = require("./routes/jobRoutes"); // Adjusted for a models directory
const locationRoutes = require("./routes/locationRoutes");
const timeCardRoutes = require("./routes/timecardRoutes");
const userRoutes = require("./routes/userRoutes");
const { adminAuth, userAuth } = require("./utils/auth");

// Express app
const app = express();

// Pulls production environment variables
const prodOriginURL = process.env.ORIGIN_INDEX;
const devOriginURL = "http://localhost:5173";
const devEmail = process.env.DEV_EMAIL;

// Enable CORS with credentials for HTTPS or HTTP based on the environment
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? [prodOriginURL] : devOriginURL,
    credentials: true,
  })
);

// Serve static assets
app.use(express.static(path.join(__dirname, "public")));

// Middle-ware for JSON in API
app.use(express.json());
app.use(cookieParser());

// API "GET" Commands
app.get("/", (req, res) => {
  res.send("Hello from node API! updated");
});

// User Protected Routes
app.get("/admin", adminAuth, (req, res) => res.send("Admin Route"));
app.get("/basic", userAuth, (req, res) => res.send("User Route"));

//Use Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/timecards", timeCardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", userRoutes);

// Serve static assets if in production
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

if (process.env.NODE_ENV === "production") {
  // Use Greenlock for HTTPS in production
  const greenlock = require("greenlock-express").init({
    packageRoot: __dirname,
    configDir: "./greenlock.d",
    maintainerEmail: process.env.DEV_EMAIL,
    cluster: false,
  });

  // Serves on 80 and 443
  // Get's SSL certificates magically!
  greenlock.serve(app);
} else {
  // In development, use regular HTTP
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
  });
}
// Connects to Mongo DB using secure credentials
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to Database");
  })

  .catch(() => {
    console.log("Error: Connecting to Database");
  });
