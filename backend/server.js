const express = require("express");
const https = require("https");
const fs = require("fs");
//const crypto = require("node:crypto");
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

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to Database"))
  .catch(() => console.log("Error: Connecting to Database"));

// Setting up the HTTPS server in production
if (process.env.NODE_ENV === "production") {
  //Stores cert and key files directory
  const keyLocation = process.env.HTTPS_KEY_LOCATION;
  const certLocation = process.env.HTTPS_CERT_LOCATION;

  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, keyLocation)),
    cert: fs.readFileSync(path.join(__dirname, certLocation)),
  };

  const port = process.env.PORT || 443;
  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
  });
} else {
  // HTTP server for development
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
  });
}

// Serve static assets for production
//app.use(express.static(path.join(__dirname, "public")));
