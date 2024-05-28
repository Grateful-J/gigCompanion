const express = require("express");
const { App, Credentials, User } = require("realm");
const path = require("path");
const router = express.Router();

const appId = process.env.MONGODB_APP_ID;
const realmApp = new App({ id: appId });

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Route to handle user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const credentials = Credentials.emailPassword(email, password);
    const user = await realmApp.logIn(credentials);
    console.log("User logged in successfully:", user.id);
    res.status(200).send({ userId: user.id, accessToken: user.accessToken });
  } catch (err) {
    console.error("User login failed:", err.message);
    res.status(400).send(`User login failed: ${err.message}`);
  }
});

// Route to handle user registration
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    await realmApp.emailPasswordAuth.registerUser({ email, password });
    console.log("User registered successfully:", email);
    res.status(200).send("Successfully registered new user.");
  } catch (err) {
    console.error("Failed to register user:", err.message);
    res.status(400).send(`Failed to register user: ${err.message}`);
  }
});

// Route to handle user confirmation
router.post("/confirm", async (req, res) => {
  const { token, tokenId } = req.body;
  try {
    await realmApp.emailPasswordAuth.confirmUser({ token, tokenId });
    console.log("User confirmed successfully");
    res.status(200).send("Successfully confirmed user.");
  } catch (err) {
    console.error("User confirmation failed:", err.message);
    res.status(400).send(`User confirmation failed: ${err.message}`);
  }
});

// Route to send password reset email
router.post("/send-reset-password-email", async (req, res) => {
  const { email } = req.body;
  try {
    await realmApp.emailPasswordAuth.sendResetPasswordEmail({ email });
    console.log("Password reset email sent:", email);
    res.status(200).send("Password reset email sent.");
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
    res.status(400).send(`Failed to send password reset email: ${err.message}`);
  }
});

// Route to reset the password
router.post("/reset-password", async (req, res) => {
  const { password, token, tokenId } = req.body;
  try {
    await realmApp.emailPasswordAuth.resetPassword({ password, token, tokenId });
    console.log("Password reset successfully");
    res.status(200).send("Password reset successful.");
  } catch (err) {
    console.error("Failed to reset password:", err.message);
    res.status(400).send(`Failed to reset password: ${err.message}`);
  }
});

module.exports = router;
