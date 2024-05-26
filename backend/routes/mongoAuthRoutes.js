const express = require("express");
const { App } = require("realm");
const path = require("path");
const router = express.Router();

const appId = process.env.MONGODB_APP_ID;
// Initialize the Realm App with your App ID
const realmApp = new App({ id: appId });

// Route to handle user registration
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    await realmApp.emailPasswordAuth.registerUser({ email, password });
    res.status(200).send("Successfully registered new user.");
  } catch (err) {
    res.status(400).send(`Failed to register user: ${err.message}`);
  }
});

// Route to serve the confirmation page
router.get("/confirm", (req, res) => {
  res.sendFile("confirm.html", { root: path.join(__dirname, "../public") });
});

// Route to handle user confirmation
router.post("/confirm", async (req, res) => {
  const { token, tokenId } = req.body;
  try {
    await realmApp.emailPasswordAuth.confirmUser({ token, tokenId });
    res.status(200).send("Successfully confirmed user.");
  } catch (err) {
    res.status(400).send(`User confirmation failed: ${err.message}`);
  }
});

// Route to send password reset email
router.post("/send-reset-password-email", async (req, res) => {
  const { email } = req.body;
  try {
    await realmApp.emailPasswordAuth.sendResetPasswordEmail({ email });
    res.status(200).send("Password reset email sent.");
  } catch (err) {
    res.status(400).send(`Failed to send password reset email: ${err.message}`);
  }
});

// Route to reset the password
router.post("/reset-password", async (req, res) => {
  const { password, token, tokenId } = req.body;
  try {
    await realmApp.emailPasswordAuth.resetPassword({ password, token, tokenId });
    res.status(200).send("Password reset successful.");
  } catch (err) {
    res.status(400).send(`Failed to reset password: ${err.message}`);
  }
});

module.exports = router;
