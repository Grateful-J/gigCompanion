const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jobRoutes = require("./routes/jobRoutes"); // Adjusted for a models directory
const locationRoutes = require("./routes/locationRoutes");
const timeCardRoutes = require("./routes/timecardRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const { adminAuth, userAuth, checkToken } = require("./utils/authController");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");
const { createHash } = require("crypto");
const realm = require("realm");
const mongoRoutes = require("./mongoRoutes");
//const { App, Credentials } = require("realm");
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
  })
);

// Middle-ware for JSON in API
//app.use(express.static(path.join(__dirname, "public"))); // for production

app.use(express.json());
app.use(cookieParser());

// Logout Route
app.get("/logout", (req, res) => {
  res.cookie("bearer", "", { maxAge: "1" });
  res.redirect("/");
});

//API Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/timecards", timeCardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs/expenses", expenseRoutes);
app.use("/api/jobs/notes", noteRoutes);

// Import mongoRoutes
app.use("/mongo", mongoRoutes);

// Routes to check if user is logged in
app.get("/admin", adminAuth, (req, res) => res.send("Admin Route"));
app.get("/basic", userAuth, (req, res) => res.send("User Route"));

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

// ! -------------------------------------------------------------------------
// ! The code below is for retention in case i blow this up any further

/* // Page Routes to check if user is logged in
app.get("/admin", requireAuth, (req, res) => res.sendFile("/admin.html"));

// Admin Protected Route
app.get("/admin", adminAuth, (req, res) => {
  res.send(req.user);
}); */

// Page Routes to check if user is logged in
//app.get("/admin", (req, res) => res.sendFile("/admin.html", { root: __dirname }));

/* // Admin Protected Route
app.get("/admin", adminAuth, (req, res) => {
  res.send(req.user);
});
 */
