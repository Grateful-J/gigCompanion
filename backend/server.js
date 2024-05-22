const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jobRoutes = require("./routes/jobRoutes"); // Adjusted for a models directory
const locationRoutes = require("./routes/locationRoutes");
const timeCardRoutes = require("./routes/timecardRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const noteRoutes = require("./routes/noteRoutes");
const { adminAuth, userAuth, checkToken } = require("./utils/authController");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");
const { createHash } = require("crypto");

// Express app
const app = express();

// Pulls production environment variables
const prodOriginURL = process.env.ORIGIN_INDEX;
const devOriginURL = "http://localhost:5173";

// CORS
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? [prodOriginURL] : devOriginURL,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middle-ware for JSON in API
//app.use(express.static(path.join(__dirname, "public"))); // for production
app.use(express.json());
app.use(cookieParser());

/* // API "GET" Commands
app.get("/", (req, res) => {
  res.send("Hello from node API! updated");
}); */

// Logout Route
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});

// Page Routes to check if user is logged in
app.get("/", requireAuth, (req, res) => res.render("/"));

// Admin Protected Route
app.get("/admin", adminAuth, (req, res) => {
  res.send(req.user);
});

//API Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/timecards", timeCardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/jobs/expenses", expenseRoutes);
app.use("/api/jobs/notes", noteRoutes);

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
